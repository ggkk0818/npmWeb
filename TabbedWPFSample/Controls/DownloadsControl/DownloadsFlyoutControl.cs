/********************************************************************************
 *    Project   : Awesomium.NET (TabbedWPFSample)
 *    File      : DownloadsFlyoutControl.cs
 *    Version   : 1.7.0.0 
 *    Date      : 2/13/2014
 *    Author    : Perikles C. Stephanidis (perikles@awesomium.com)
 *    Copyright : ©2014 Awesomium Technologies LLC
 *    
 *    This code is provided "AS IS" and for demonstration purposes only,
 *    without warranty of any kind.
 *     
 *-------------------------------------------------------------------------------
 *
 *    Notes     :
 *
 *    A control presenting a list of download operations.
 *    
 *    
 ********************************************************************************/

using System;
using System.Windows;
using System.Windows.Controls;
using System.Collections.Generic;
using Awesomium.Core;

namespace TabbedWPFSample
{
    internal class DownloadsFlyoutControl : ListBox
    {
        static DownloadsFlyoutControl()
        {
            DefaultStyleKeyProperty.OverrideMetadata( typeof( DownloadsFlyoutControl ), new FrameworkPropertyMetadata( typeof( DownloadsFlyoutControl ) ) );
        }
    }
}
