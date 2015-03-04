/********************************************************************************
 *    Project   : Awesomium.NET (TabbedWPFSample)
 *    File      : CustomUriValueConverter.cs
 *    Version   : 1.7.0.0 
 *    Date      : 03/12/2014
 *    Author    : Perikles C. Stephanidis (perikles@awesomium.com)
 *    Copyright : ©2014 Awesomium Technologies LLC
 *-------------------------------------------------------------------------------
 *
 *    Notes     :
 *
 *    We subclass the default UriValueConverter used by SourceBinding,
 *    to handle badly formatted URIs and trigger a search.
 *    
 *    
 ********************************************************************************/

using System;
using System.Linq;
using System.Windows.Data;
using System.Globalization;
using System.Windows.Input;
using Awesomium.Windows.Data;
using System.Collections.Generic;

namespace TabbedWPFSample
{
    class CustomUriValueConverter : UriValueConverter
    {
        public override object ConvertBack( object value, Type targetType, object parameter, CultureInfo culture )
        {
            if ( ( value is String ) && ( parameter is ICommand ) )
            {
                string url = (String)value;
                ICommand command = (ICommand)parameter;

                if ( !Uri.IsWellFormedUriString( url, UriKind.RelativeOrAbsolute ) )
                {
                    command.Execute( url );
                    return Binding.DoNothing;
                }
            }

            return base.ConvertBack( value, targetType, parameter, culture );
        }
    }
}
