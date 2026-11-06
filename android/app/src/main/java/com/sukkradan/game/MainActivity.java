package com.sukkradan.game;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

/** Wraps the single-file game (assets/index.html) in a full-screen WebView. */
public class MainActivity extends Activity {
    private WebView web;

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);      // saves the campaign in localStorage
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setBackgroundColor(Color.BLACK);
        setContentView(web);
        web.loadUrl("file:///android_asset/index.html");
    }

    @Override protected void onPause() { super.onPause(); if (web != null) web.onPause(); }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }

    // The game decides: close a sheet ("stay") or leave the app ("exit", after saving).
    @Override public void onBackPressed() {
        web.evaluateJavascript("(window.__back?window.__back():'exit')", v -> { if ("\"exit\"".equals(v)) finish(); });
    }
}
