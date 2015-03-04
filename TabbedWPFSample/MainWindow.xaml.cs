/********************************************************************************
 *    Project   : Awesomium.NET (TabbedWPFSample)
 *    File      : MainWindow.cs
 *    Version   : 1.7.0.0 
 *    Date      : 3/5/2013
 *    Author    : Perikles C. Stephanidis (perikles@awesomium.com)
 *    Copyright : ©2013 Awesomium Technologies LLC
 *    
 *    This code is provided "AS IS" and for demonstration purposes only,
 *    without warranty of any kind.
 *     
 *-------------------------------------------------------------------------------
 *
 *    Notes     :
 *
 *    Application window. This does not act as a main-parent window. 
 *    It's reusable. The application will exit when all windows are closed.
 *    Completely styled with a custom WindowChrome. Check the XAML file
 *    in Generic.xaml.
 *    
 *    
 ********************************************************************************/

#region Using
using System;
using System.IO;
using System.Linq;
using MahApps.Metro;
using System.Windows;
using Awesomium.Core;
using System.Windows.Input;
using System.Windows.Media;
using System.ComponentModel;
using MahApps.Metro.Controls;
using System.Windows.Controls;
using System.Collections.Generic;
using TabbedWPFSample.Properties;
using Awesomium.Windows.Controls;
#endregion

namespace TabbedWPFSample
{
    partial class MainWindow : MetroWindow
    {
        #region Fields
        private string[] initialUrls;
        private TabViewCollection tabViews;
        private WebPreferences initialPreferences;

        private const string JIF_EXTENSIONS = @"if (OSMView) { " + 
            /* Add a |getSize| method to all OSMViews that gets a textual representation of the view's size. */
            "OSMView.prototype.getSize = function() { var info = this.getInfo(); return info.width + 'x' + info.height;  }; " +
            /* Add a |goHome| method to all OSMViews that tells the view to navigate to a specific address. */
            "OSMView.prototype.goHome = function() { if (this.isLive) this.source = 'http://www.awesomium.com'; }; " + 
            "}";
        #endregion


        #region Ctors
        static MainWindow()
        {
            // We implement some elementary commands.
            // The shortcuts specified, are the same as in Chrome.
            OpenInTab = new RoutedUICommand(
                Properties.Resources.OpenInNewTab,
                "OpenInTab",
                typeof( MainWindow ),
                new InputGestureCollection( new KeyGesture[] { new KeyGesture( Key.Enter, ModifierKeys.Control ) } ) );
            OpenInWindow = new RoutedUICommand(
                Properties.Resources.OpenInNewWindow,
                "OpenInWindow",
                typeof( MainWindow ),
                new InputGestureCollection( new KeyGesture[] { new KeyGesture( Key.Enter, ModifierKeys.Shift ) } ) );
            NewTab = new RoutedUICommand(
                Properties.Resources.NewTab,
                "NewTab",
                typeof( MainWindow ),
                new InputGestureCollection( new KeyGesture[] { new KeyGesture( Key.T, ModifierKeys.Control ) } ) );
            CloseTab = new RoutedUICommand(
                Properties.Resources.CloseTab,
                "CloseTab",
                typeof( MainWindow ),
                new InputGestureCollection( new KeyGesture[] { new KeyGesture( Key.W, ModifierKeys.Control ) } ) );
            ShowDownloads = new RoutedUICommand(
                Properties.Resources.Downloads,
                "ShowDownloads",
                typeof( MainWindow ) );
            ShowSettings = new RoutedUICommand(
                Properties.Resources.Settings,
                "ShowSettings",
                typeof( MainWindow ) );
            OpenSource = new RoutedUICommand(
                Properties.Resources.ShowSource,
                "OpenSource",
                typeof( MainWindow ) );
            CloseSettings = new RoutedUICommand(
                Properties.Resources.CloseFlyout,
                "CloseSettings",
                typeof( MainWindow ) );
            UpdateHomeURL = new RoutedUICommand(
                Properties.Resources.UpdateHomeURL,
                "UpdateHomeURL",
                typeof( MainWindow ) );
            Search = new RoutedUICommand(
                Properties.Resources.Search,
                "Search",
                typeof( MainWindow ) );
            RestartApplication = new RoutedUICommand(
                Properties.Resources.Restart,
                "Restart",
                typeof( MainWindow ) );
        }

        public MainWindow( string[] args )
        {
            InitializeComponent();

            // Load theme.
            ThemeManager.ChangeTheme( Application.Current, ThemeManager.DefaultAccents[ Settings.Default.CurrentAccent ], (Theme)Settings.Default.CurrentTheme );
            this.MetroDialogOptions.ColorScheme = MahApps.Metro.Controls.Dialogs.MetroDialogColorScheme.Accented;

            // Keep this for comparison.
            // If we change preferences, we need to restart
            // the application for the changes to be applied.
            initialPreferences = Settings.Default.WebPreferences;

            // Keep this. We will use it when we load.
            initialUrls = args;

            // Initialize collections.
            tabViews = new TabViewCollection();
            this.SetValue( MainWindow.ViewsPropertyKey, tabViews );
            this.SetValue( MainWindow.DownloadsPropertyKey, WebCore.Downloads );
            this.SetValue( MainWindow.AccentsPropertyKey,
                ThemeManager.DefaultAccents.Select(
                a => new AccentColorMenuData()
                {
                    Name = a.Name,
                    ColorBrush = a.Resources[ "AccentColorBrush" ] as Brush
                } ).ToList() );

            // Assign event handlers.
            this.Loaded += OnLoaded;

            // Assign command handlers.
            this.CommandBindings.Add( new CommandBinding( MainWindow.OpenInTab, OnOpenTab, CanOpen ) );
            this.CommandBindings.Add( new CommandBinding( MainWindow.OpenInWindow, OnOpenWindow, CanOpen ) );
            this.CommandBindings.Add( new CommandBinding( MainWindow.OpenSource, OnOpenSource, CanOpenSource ) );
            this.CommandBindings.Add( new CommandBinding( MainWindow.CloseTab, OnCloseTab ) );
            this.CommandBindings.Add( new CommandBinding( MainWindow.NewTab, OnNewTab ) );
            this.CommandBindings.Add( new CommandBinding( MainWindow.ShowDownloads, OnShowDownloads ) );
            this.CommandBindings.Add( new CommandBinding( MainWindow.ShowSettings, OnShowSettings ) );
            this.CommandBindings.Add( new CommandBinding( MainWindow.CloseSettings, OnCloseSettings ) );
            this.CommandBindings.Add( new CommandBinding( MainWindow.UpdateHomeURL, OnUpdateHomeURL ) );
            this.CommandBindings.Add( new CommandBinding( MainWindow.Search, OnSearch ) );
            this.CommandBindings.Add( new CommandBinding( MainWindow.RestartApplication, OnRestartApplication ) );
            this.CommandBindings.Add( new CommandBinding( ApplicationCommands.Close, OnClose ) );

            // Perform lazy initialization of the WebCore.
            this.InitializeCore();
        }
        #endregion


        #region Overrides
        protected override void OnClosing( CancelEventArgs e )
        {
            // Hide during cleanup.
            this.Hide();

            // Close the views and perform cleanup
            // for every tab.
            foreach ( TabView view in tabViews )
                view.Close();

            tabViews.Clear();

            // Save settings.
            Settings.Default.Save();

            // There may be more than one MainWindows open.
            // We shutdown the core from Application.OnExit.

            base.OnClosing( e );
        }

        protected override void OnPreviewMouseDown( MouseButtonEventArgs e )
        {
            base.OnPreviewMouseDown( e );

            // We have replaced the default Header template for the
            // Settings flyout, so that it does not include a close
            // button. We then simulate auto-close here. When the
            // user clicks anywhere but inside the Setting flyout,
            // we close the Settings flyout.
            if ( !settingsFlyout.IsMouseOver )
                settingsFlyout.IsOpen = false;
        }
        #endregion

        #region Methods

        #region InitializeCore
        private void InitializeCore()
        {
            // We may be a new window in the same process.
            if ( !WebCore.IsInitialized )
            {
                // Specify some configuration settings for Awesomium.
                WebConfig config = new WebConfig
                {
                    // For this sample, we use our custom native child process
                    // as Awesomium rendering process. See how we create this
                    // under the Core\C++ solution folder.
                    ChildProcessPath = String.Format( "{0}{1}Awesomium.exe", My.Application.Info.DirectoryPath, Path.DirectorySeparatorChar ),
                    HomeURL = Settings.Default.HomeURL,
                    // Save the log file to the user's Application Data folder.
                    LogPath = String.Format( "{0}{1}debug.log", My.Application.UserAppDataPath, Path.DirectorySeparatorChar ),
                    // Let's gather some extra info for this sample.
                    LogLevel = LogLevel.Verbose,
                    // Allow remote debugging.
                    RemoteDebuggingPort = 9033,
                    // We demonstrate extending the prototype of one of the types 
                    // provided by the Javascript Interoperation Framework (JIF).
                    UserScript = JIF_EXTENSIONS
                };

                // Initialize the core. This performs lazy initialization.
                // The core will actually be initialized, when the first
                // view (WebControl) or WebSession is created.
                WebCore.Initialize( config );
            }

            // Handle this to show our Downloads bar and flyout,
            // whenever a download operation starts.
            WebCore.DownloadBegin += OnDownloadBegin;
        }
        #endregion

        #region OpenURL
        public void OpenURL( Uri url, bool isSource = false )
        {
            tabViews.Add( new TabView( this, url, isSource ) );
        }

        public void OpenURL( IntPtr nativeView )
        {
            tabViews.Add( new TabView( this, nativeView ) );
            // Make sure that the new tab is shown before this method returns.
            // This will force the tab's template to be applied, which will in turn
            // create and load the WebControl that wraps the new child view,
            // before the IWebView.ShowCreatedWebView handler returns.
            // (see also: TabView.OnApplyTemplate)
            Application.Current.DoEvents();
        }
        #endregion

        #endregion

        #region Properties

        #region Commands
        public static RoutedUICommand OpenInTab { get; private set; }
        public static RoutedUICommand OpenInWindow { get; private set; }
        public static RoutedUICommand OpenSource { get; private set; }
        public static RoutedUICommand NewTab { get; private set; }
        public static RoutedUICommand CloseTab { get; private set; }
        public static RoutedUICommand ShowDownloads { get; private set; }
        public static RoutedUICommand ShowSettings { get; private set; }
        public static RoutedUICommand CloseSettings { get; private set; }
        public static RoutedUICommand UpdateHomeURL { get; private set; }
        public static RoutedUICommand Search { get; private set; }
        public static RoutedUICommand RestartApplication { get; private set; }
        #endregion


        #region Views
        // Collection of TabViews populating our WebTabControl.
        public IEnumerable<TabView> Views
        {
            get { return (IEnumerable<TabView>)this.GetValue( MainWindow.ViewsProperty ); }
        }

        private static readonly DependencyPropertyKey ViewsPropertyKey =
            DependencyProperty.RegisterReadOnly( "Views",
            typeof( IEnumerable<TabView> ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( null ) );

        public static readonly DependencyProperty ViewsProperty =
            ViewsPropertyKey.DependencyProperty;
        #endregion

        #region Downloads
        // Note that this is the core DownloadItem. Not the WPF subclass.
        // Otherwise we would not be able to set this to WebCore.Downloads.
        public IEnumerable<Awesomium.Core.DownloadItem> Downloads
        {
            get { return (IEnumerable<Awesomium.Core.DownloadItem>)this.GetValue( MainWindow.DownloadsProperty ); }
        }

        private static readonly DependencyPropertyKey DownloadsPropertyKey =
            DependencyProperty.RegisterReadOnly( "Downloads",
            typeof( IEnumerable<Awesomium.Core.DownloadItem> ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( null ) );

        public static readonly DependencyProperty DownloadsProperty =
            DownloadsPropertyKey.DependencyProperty;
        #endregion

        #region DownloadsVisible
        // Shows/hides the DownloadsControl.
        public bool DownloadsVisible
        {
            get { return (bool)this.GetValue( MainWindow.DownloadsVisibleProperty ); }
            protected set { this.SetValue( MainWindow.DownloadsVisiblePropertyKey, value ); }
        }

        private static readonly DependencyPropertyKey DownloadsVisiblePropertyKey =
            DependencyProperty.RegisterReadOnly( "DownloadsVisible",
            typeof( bool ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( false ) );

        public static readonly DependencyProperty DownloadsVisibleProperty =
            DownloadsVisiblePropertyKey.DependencyProperty;
        #endregion

        #region SelectedView
        // The currently selected tabView.
        public TabView SelectedView
        {
            get { return (TabView)this.GetValue( MainWindow.SelectedViewProperty ); }
            internal set { this.SetValue( MainWindow.SelectedViewPropertyKey, value ); }
        }

        private static readonly DependencyPropertyKey SelectedViewPropertyKey =
            DependencyProperty.RegisterReadOnly( "SelectedView",
            typeof( TabView ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( null ) );

        public static readonly DependencyProperty SelectedViewProperty =
            SelectedViewPropertyKey.DependencyProperty;
        #endregion


        #region Settings

        #region FullScreenOnMaximize
        public bool FullScreenOnMaximize
        {
            get { return (bool)GetValue( FullScreenOnMaximizeProperty ); }
            set { SetValue( FullScreenOnMaximizeProperty, value ); }
        }

        /// <summary>
        /// Identifies the <see cref="FullScreenOnMaximize"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty FullScreenOnMaximizeProperty =
            DependencyProperty.Register( "FullScreenOnMaximize",
            typeof( bool ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( Settings.Default.FullScreenOnMaximize, FullScreenOnMaximizeChanged ) );

        private static void FullScreenOnMaximizeChanged( DependencyObject d, DependencyPropertyChangedEventArgs e )
        {
            MainWindow owner = (MainWindow)d;
            bool value = (bool)e.NewValue;

            Settings.Default.FullScreenOnMaximize = value;
        }
        #endregion

        #region Accents
        public IList<AccentColorMenuData> Accents
        {
            get { return (IList<AccentColorMenuData>)GetValue( AccentsProperty ); }
        }

        /// <summary>
        /// Identifies the <see cref="Accents"/> dependency property.
        /// </summary>
        private static readonly DependencyPropertyKey AccentsPropertyKey =
            DependencyProperty.RegisterReadOnly( "Accents",
            typeof( IList<AccentColorMenuData> ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( null ) );

        /// <summary>
        /// Identifies the <see cref="Accents"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty AccentsProperty =
            AccentsPropertyKey.DependencyProperty;
        #endregion

        #region CurrentTheme
        public int CurrentTheme
        {
            get { return (int)GetValue( CurrentThemeProperty ); }
            set { SetValue( CurrentThemeProperty, value ); }
        }

        /// <summary>
        /// Identifies the <see cref="CurrentTheme"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty CurrentThemeProperty =
            DependencyProperty.Register( "CurrentTheme",
            typeof( int ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( Settings.Default.CurrentTheme, CurrentThemeChanged ) );

        private static void CurrentThemeChanged( DependencyObject d, DependencyPropertyChangedEventArgs e )
        {
            MainWindow owner = (MainWindow)d;
            int value = (int)e.NewValue;

            Settings.Default.CurrentTheme = value;
            ThemeManager.ChangeTheme( Application.Current, ThemeManager.DefaultAccents[ Settings.Default.CurrentAccent ], (Theme)value );
        }
        #endregion

        #region CurrentAccent
        public int CurrentAccent
        {
            get { return (int)GetValue( CurrentAccentProperty ); }
            set { SetValue( CurrentAccentProperty, value ); }
        }

        /// <summary>
        /// Identifies the <see cref="CurrentAccent"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty CurrentAccentProperty =
            DependencyProperty.Register( "CurrentAccent",
            typeof( int ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( Settings.Default.CurrentAccent, CurrentAccentChanged ) );

        private static void CurrentAccentChanged( DependencyObject d, DependencyPropertyChangedEventArgs e )
        {
            MainWindow owner = (MainWindow)d;
            int value = (int)e.NewValue;

            Settings.Default.CurrentAccent = value;
            ThemeManager.ChangeTheme( Application.Current, ThemeManager.DefaultAccents[ value ], (Theme)Settings.Default.CurrentTheme );
        }
        #endregion

        #region HomeURL
        public Uri HomeURL
        {
            get { return (Uri)GetValue( HomeURLProperty ); }
            set { SetValue( HomeURLProperty, value ); }
        }

        /// <summary>
        /// Identifies the <see cref="HomeURL"/> dependency property.
        /// </summary>
        /// <remarks>
        /// Notice that we register this as Source. This way we can use
        /// a SourceBinding with it.
        /// </remarks>
        public static readonly DependencyProperty HomeURLProperty =
            DependencyProperty.Register( "Source",
            typeof( Uri ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( Settings.Default.HomeURL, HomeURLChanged ) );

        private static void HomeURLChanged( DependencyObject d, DependencyPropertyChangedEventArgs e )
        {
            MainWindow owner = (MainWindow)d;
            Uri value = (Uri)e.NewValue;

            Settings.Default.HomeURL = value;

            if ( WebCore.IsInitialized )
                WebCore.HomeURL = value;
        }
        #endregion

        #region Restart
        public bool Restart
        {
            get { return (bool)GetValue( RestartProperty ); }
        }

        /// <summary>
        /// Identifies the <see cref="Restart"/> dependency property.
        /// </summary>
        private static readonly DependencyPropertyKey RestartPropertyKey =
            DependencyProperty.RegisterReadOnly( "Restart",
            typeof( bool ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( false, null, CoerceRestart ) );

        /// <summary>
        /// Identifies the <see cref="Restart"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty RestartProperty =
            RestartPropertyKey.DependencyProperty;

        private static object CoerceRestart( DependencyObject d, object baseValue )
        {
            MainWindow owner = (MainWindow)d;
            return owner.initialPreferences != Settings.Default.WebPreferences;
        }
        #endregion

        #region Preferences
        // Static property used by XAML to access the saved WebPreferences.
        // See our global WebSessionProvider defined in TabView.xaml
        [Browsable( false )]
        [EditorBrowsable( EditorBrowsableState.Never )]
        public static WebPreferences WebPreferences
        {
            get
            {
                return Settings.Default.WebPreferences;
            }
        }


        public bool Plugins
        {
            get { return (bool)GetValue( PluginsProperty ); }
            set { SetValue( PluginsProperty, value ); }
        }

        /// <summary>
        /// Identifies the <see cref="Plugins"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty PluginsProperty =
            DependencyProperty.Register( "Plugins",
            typeof( bool ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( Settings.Default.WebPreferences.Plugins, PluginsChanged ) );

        private static void PluginsChanged( DependencyObject d, DependencyPropertyChangedEventArgs e )
        {
            MainWindow owner = (MainWindow)d;
            bool value = (bool)e.NewValue;

            WebPreferences currentPrefs = WebPreferences;
            currentPrefs.Plugins = value;
            Settings.Default.WebPreferences = currentPrefs;
            owner.CoerceValue( MainWindow.RestartProperty );
        }

        public bool AllowInsecureContent
        {
            get { return (bool)GetValue( AllowInsecureContentProperty ); }
            set { SetValue( AllowInsecureContentProperty, value ); }
        }

        /// <summary>
        /// Identifies the <see cref="AllowInsecureContent"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty AllowInsecureContentProperty =
            DependencyProperty.Register( "AllowInsecureContent",
            typeof( bool ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( Settings.Default.WebPreferences.AllowInsecureContent, AllowInsecureContentChanged ) );

        private static void AllowInsecureContentChanged( DependencyObject d, DependencyPropertyChangedEventArgs e )
        {
            MainWindow owner = (MainWindow)d;
            bool value = (bool)e.NewValue;

            WebPreferences currentPrefs = WebPreferences;
            currentPrefs.AllowInsecureContent = value;
            Settings.Default.WebPreferences = currentPrefs;
            owner.CoerceValue( MainWindow.RestartProperty );
        }

        public bool WebSecurity
        {
            get { return (bool)GetValue( WebSecurityProperty ); }
            set { SetValue( WebSecurityProperty, value ); }
        }

        /// <summary>
        /// Identifies the <see cref="WebSecurity"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty WebSecurityProperty =
            DependencyProperty.Register( "WebSecurity",
            typeof( bool ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( Settings.Default.WebPreferences.WebSecurity, WebSecurityChanged ) );

        private static void WebSecurityChanged( DependencyObject d, DependencyPropertyChangedEventArgs e )
        {
            MainWindow owner = (MainWindow)d;
            bool value = (bool)e.NewValue;

            WebPreferences currentPrefs = WebPreferences;
            currentPrefs.WebSecurity = value;
            Settings.Default.WebPreferences = currentPrefs;
            owner.CoerceValue( MainWindow.RestartProperty );
        }
        #endregion

        #region Advanced
        // Static property used by XAML to access the path for saving
        // cache and cookies. See our global WebSessionProvider defined 
        // in TabView.xaml
        [Browsable( false )]
        [EditorBrowsable( EditorBrowsableState.Never )]
        public static string CachePath
        {
            get
            {
                return Settings.Default.CachePath;
            }
        }


        public bool Cookies
        {
            get { return (bool)GetValue( CookiesProperty ); }
            set { SetValue( CookiesProperty, value ); }
        }

        /// <summary>
        /// Identifies the <see cref="Cookies"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty CookiesProperty =
            DependencyProperty.Register( "Cookies",
            typeof( bool ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( !String.IsNullOrEmpty( Settings.Default.CachePath ), CookiesChanged ) );

        private static void CookiesChanged( DependencyObject d, DependencyPropertyChangedEventArgs e )
        {
            MainWindow owner = (MainWindow)d;
            bool value = (bool)e.NewValue;

            Settings.Default.CachePath = value ? @".\Cache" : String.Empty;
        }

        public bool ShowImages
        {
            get { return (bool)GetValue( ShowImagesProperty ); }
            set { SetValue( ShowImagesProperty, value ); }
        }

        /// <summary>
        /// Identifies the <see cref="ShowImages"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty ShowImagesProperty =
            DependencyProperty.Register( "ShowImages",
            typeof( bool ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( Settings.Default.WebPreferences.LoadImagesAutomatically, ShowImagesChanged ) );

        private static void ShowImagesChanged( DependencyObject d, DependencyPropertyChangedEventArgs e )
        {
            MainWindow owner = (MainWindow)d;
            bool value = (bool)e.NewValue;

            WebPreferences currentPrefs = WebPreferences;
            currentPrefs.LoadImagesAutomatically = value;
            Settings.Default.WebPreferences = currentPrefs;
            owner.CoerceValue( MainWindow.RestartProperty );
        }

        public bool Javascript
        {
            get { return (bool)GetValue( JavascriptProperty ); }
            set { SetValue( JavascriptProperty, value ); }
        }

        /// <summary>
        /// Identifies the <see cref="Javascript"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty JavascriptProperty =
            DependencyProperty.Register( "Javascript",
            typeof( bool ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( Settings.Default.WebPreferences.Javascript, JavascriptChanged ) );

        private static void JavascriptChanged( DependencyObject d, DependencyPropertyChangedEventArgs e )
        {
            MainWindow owner = (MainWindow)d;
            bool value = (bool)e.NewValue;

            WebPreferences currentPrefs = WebPreferences;
            currentPrefs.Javascript = value;
            Settings.Default.WebPreferences = currentPrefs;
            owner.CoerceValue( MainWindow.RestartProperty );
        }

        public bool UniversalAccessFromFileURL
        {
            get { return (bool)GetValue( UniversalAccessFromFileURLProperty ); }
            set { SetValue( UniversalAccessFromFileURLProperty, value ); }
        }

        /// <summary>
        /// Identifies the <see cref="UniversalAccessFromFileURL"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty UniversalAccessFromFileURLProperty =
            DependencyProperty.Register( "UniversalAccessFromFileURL",
            typeof( bool ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( Settings.Default.WebPreferences.UniversalAccessFromFileURL, UniversalAccessFromFileURLChanged ) );

        private static void UniversalAccessFromFileURLChanged( DependencyObject d, DependencyPropertyChangedEventArgs e )
        {
            MainWindow owner = (MainWindow)d;
            bool value = (bool)e.NewValue;

            WebPreferences currentPrefs = WebPreferences;
            currentPrefs.UniversalAccessFromFileURL = value;
            Settings.Default.WebPreferences = currentPrefs;
            owner.CoerceValue( MainWindow.RestartProperty );
        }

        public bool FileAccessFromFileURL
        {
            get { return (bool)GetValue( FileAccessFromFileURLProperty ); }
            set { SetValue( FileAccessFromFileURLProperty, value ); }
        }

        /// <summary>
        /// Identifies the <see cref="FileAccessFromFileURL"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty FileAccessFromFileURLProperty =
            DependencyProperty.Register( "FileAccessFromFileURL",
            typeof( bool ), typeof( MainWindow ),
            new FrameworkPropertyMetadata( Settings.Default.WebPreferences.FileAccessFromFileURL, FileAccessFromFileURLChanged ) );

        private static void FileAccessFromFileURLChanged( DependencyObject d, DependencyPropertyChangedEventArgs e )
        {
            MainWindow owner = (MainWindow)d;
            bool value = (bool)e.NewValue;

            WebPreferences currentPrefs = WebPreferences;
            currentPrefs.FileAccessFromFileURL = value;
            Settings.Default.WebPreferences = currentPrefs;
            owner.CoerceValue( MainWindow.RestartProperty );
        }
        #endregion

        #endregion

        #endregion

        #region Event Handlers
        private void OnLoaded( object sender, RoutedEventArgs e )
        {
            // Just like any respectable browser, we are ready to respond
            // to command line arguments passed if our browser is set as
            // the default browser or when a user attempts to open an html
            // file or shortcut with our application.
            bool openUrl = false;
            if ( ( initialUrls != null ) && ( initialUrls.Length > 0 ) )
            {
                foreach ( String url in initialUrls )
                {
                    Uri absoluteUri;
                    Uri.TryCreate( url, UriKind.Absolute, out absoluteUri );

                    if ( absoluteUri != null )
                    {
                        this.OpenURL( absoluteUri );
                        openUrl = true;
                    }
                }

                initialUrls = null;
            }

            if ( !openUrl )
                this.OpenURL( Settings.Default.HomeURL );
        }

        private void OnOpenTab( object sender, ExecutedRoutedEventArgs e )
        {
            // If this is called from a menu item, the target URL is specified as a parameter.
            // If the user simply hit the shortcut, we need to get the target URL (if any) from the currently selected tab.
            // The same applies for the rest of link related commands below.
            string target = (string)e.Parameter ?? ( SelectedView != null ? SelectedView.Browser.LatestContextData.LinkURL.AbsoluteUri : String.Empty );

            if ( !String.IsNullOrWhiteSpace( target ) )
                this.OpenURL( target.ToUri() );
        }

        private void OnOpenWindow( object sender, ExecutedRoutedEventArgs e )
        {
            string target = (string)e.Parameter ?? ( SelectedView != null ? SelectedView.Browser.LatestContextData.LinkURL.AbsoluteUri : String.Empty );

            if ( !String.IsNullOrWhiteSpace( target ) )
            {
                // Open link in a new window.
                MainWindow win = new MainWindow( new string[] { target } );
                win.Show();
            }
        }

        private void CanOpen( object sender, CanExecuteRoutedEventArgs e )
        {
            string target = (string)e.Parameter ?? ( SelectedView != null ? SelectedView.Browser.LatestContextData.LinkURL.AbsoluteUri : String.Empty );
            e.CanExecute = !String.IsNullOrWhiteSpace( target );
        }

        private void OnOpenSource( object sender, ExecutedRoutedEventArgs e )
        {
            Uri target = (Uri)e.Parameter ?? ( SelectedView != null ? SelectedView.Browser.Source : null );

            if ( ( target != null ) && !target.IsBlank() )
                this.OpenURL( target, true );
        }

        private void CanOpenSource( object sender, CanExecuteRoutedEventArgs e )
        {
            Uri target = (Uri)e.Parameter ?? ( SelectedView != null ? SelectedView.Browser.Source : null );
            e.CanExecute = ( target != null ) && !target.IsBlank();
        }

        private void OnNewTab( object sender, ExecutedRoutedEventArgs e )
        {
            this.OpenURL( Settings.Default.HomeURL );
        }

        private void OnCloseTab( object sender, ExecutedRoutedEventArgs e )
        {
            if ( ( e.Parameter != null ) && ( e.Parameter is TabView ) )
            {
                if ( tabViews.Count == 1 )
                    // This is the last tab we are attempting to close.
                    // Close the window. If this is the last window, the application exits.
                    this.Close();
                else
                {
                    TabView view = (TabView)e.Parameter;
                    // Remove the tab.
                    tabViews.Remove( view );
                    // Close the view and the WebControl.
                    view.Close();
                    // Perform some hard cleanup here.
                    GC.Collect();
                }
            }
        }

        private void OnDownloadBegin( object sender, DownloadBeginEventArgs e )
        {
            // Show the Downloads tray if the view that triggered the download,
            // is presented in this window.
            if ( this.Views.Any( tab => tab.Browser != null && tab.Browser.Identifier == e.Info.OriginViewId ) )
                this.DownloadsVisible = true;
        }

        private void OnShowDownloads( object sender, ExecutedRoutedEventArgs e )
        {
            downloadsFlyout.IsOpen = true;
        }

        private void OnShowSettings( object sender, ExecutedRoutedEventArgs e )
        {
            int index = 0;
            Int32.TryParse( (string)e.Parameter, out index );

            if ( index == 0 )
                settingsFlyout.IsOpen = true;
            else
            {
                settingsFlyout.IsOpen = false;
                ( (Flyout)this.Flyouts.Items[ index ] ).IsOpen = true;
            }

            // If the changes made require a restart (such as changes to
            // the WebCore configuration), set My.Application.Restart
            // to true and close the application.
            return;
        }

        private void OnUpdateHomeURL( object sender, ExecutedRoutedEventArgs e )
        {
            if ( this.SelectedView == null || this.SelectedView.Browser == null || !this.SelectedView.Browser.IsLive )
                return;

            // Update the HomeURL setting using the URL loaded to
            // the currently selected tab.
            this.HomeURL = this.SelectedView.Browser.Source;
        }

        private void OnCloseSettings( object sender, ExecutedRoutedEventArgs e )
        {
            settingsFlyout.IsOpen = true;
        }

        private void OnSearch( object sender, ExecutedRoutedEventArgs e )
        {
            if ( e.Parameter == null )
                return;

            if ( this.SelectedView == null || this.SelectedView.Browser == null || !this.SelectedView.Browser.IsLive )
                return;

            string query = e.Parameter is TextBox ? ( (TextBox)e.Parameter ).Text : e.Parameter.ToString();
            query = query.Replace( ' ', '+' );

            this.SelectedView.Browser.Source = String.Format( @"http://google.com/search?v=1.0&q={0}", query ).ToUri();
        }

        private void OnClose( object sender, ExecutedRoutedEventArgs e )
        {
            // The command we handle here is ApplicationCommands.Close. We need to maintain
            // the re-usability of this command, so we define a parameter for the downloads bar.
            if ( String.Equals( (string)e.Parameter, "Downloads", StringComparison.OrdinalIgnoreCase ) )
                this.DownloadsVisible = false;
        }

        private void OnRestartApplication( object sender, ExecutedRoutedEventArgs e )
        {
            // We only set this here so that if users simply close
            // the application from the close button, the application
            // will not be restarted.
            My.Application.Restart = this.Restart;

            foreach ( Window window in Application.Current.Windows )
                window.Close();
        }
        #endregion
    }
}