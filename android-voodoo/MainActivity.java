package com.amirkap.perfectshot;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(VoodooAnalyticsPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
