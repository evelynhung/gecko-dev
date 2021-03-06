/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that the pref commands work

let prefBranch = Cc["@mozilla.org/preferences-service;1"]
                    .getService(Ci.nsIPrefService).getBranch(null)
                    .QueryInterface(Ci.nsIPrefBranch2);

let supportsString = Cc["@mozilla.org/supports-string;1"]
                      .createInstance(Ci.nsISupportsString);

const TEST_URI = "data:text/html;charset=utf-8,gcli-settings";

function test() {
  return Task.spawn(spawnTest).then(finish, helpers.handleError);
}

function spawnTest() {
  // Setup
  let options = yield helpers.openTab(TEST_URI);

  require("devtools/commandline/commands-index");
  let gcli = require("gcli/index");
  yield gcli.load();
  let settings = gcli.settings;

  let tiltEnabled = settings.get("devtools.tilt.enabled");
  let tabSize = settings.get("devtools.editor.tabsize");
  let remoteHost = settings.get("devtools.debugger.remote-host");

  let tiltEnabledOrig = prefBranch.getBoolPref("devtools.tilt.enabled");
  let tabSizeOrig = prefBranch.getIntPref("devtools.editor.tabsize");
  let remoteHostOrig = prefBranch.getComplexValue(
          "devtools.debugger.remote-host",
          Components.interfaces.nsISupportsString).data;

  info("originally: devtools.tilt.enabled = " + tiltEnabledOrig);
  info("originally: devtools.editor.tabsize = " + tabSizeOrig);
  info("originally: devtools.debugger.remote-host = " + remoteHostOrig);

  // Actual tests
  is(tiltEnabled.value, tiltEnabledOrig, "tiltEnabled default");
  is(tabSize.value, tabSizeOrig, "tabSize default");
  is(remoteHost.value, remoteHostOrig, "remoteHost default");

  tiltEnabled.setDefault();
  tabSize.setDefault();
  remoteHost.setDefault();

  let tiltEnabledDefault = tiltEnabled.value;
  let tabSizeDefault = tabSize.value;
  let remoteHostDefault = remoteHost.value;

  tiltEnabled.value = false;
  tabSize.value = 42;
  remoteHost.value = "example.com"

  is(tiltEnabled.value, false, "tiltEnabled basic");
  is(tabSize.value, 42, "tabSize basic");
  is(remoteHost.value, "example.com", "remoteHost basic");

  function tiltEnabledCheck(ev) {
    is(ev.setting, tiltEnabled, "tiltEnabled event setting");
    is(ev.value, true, "tiltEnabled event value");
    is(ev.setting.value, true, "tiltEnabled event setting value");
  }
  tiltEnabled.onChange.add(tiltEnabledCheck);
  tiltEnabled.value = true;
  is(tiltEnabled.value, true, "tiltEnabled change");

  function tabSizeCheck(ev) {
    is(ev.setting, tabSize, "tabSize event setting");
    is(ev.value, 1, "tabSize event value");
    is(ev.setting.value, 1, "tabSize event setting value");
  }
  tabSize.onChange.add(tabSizeCheck);
  tabSize.value = 1;
  is(tabSize.value, 1, "tabSize change");

  function remoteHostCheck(ev) {
    is(ev.setting, remoteHost, "remoteHost event setting");
    is(ev.value, "y.com", "remoteHost event value");
    is(ev.setting.value, "y.com", "remoteHost event setting value");
  }
  remoteHost.onChange.add(remoteHostCheck);
  remoteHost.value = "y.com";
  is(remoteHost.value, "y.com", "remoteHost change");

  tiltEnabled.onChange.remove(tiltEnabledCheck);
  tabSize.onChange.remove(tabSizeCheck);
  remoteHost.onChange.remove(remoteHostCheck);

  function remoteHostReCheck(ev) {
    is(ev.setting, remoteHost, "remoteHost event reset");
    is(ev.value, null, "remoteHost event revalue");
    is(ev.setting.value, null, "remoteHost event setting revalue");
  }
  remoteHost.onChange.add(remoteHostReCheck);

  tiltEnabled.setDefault();
  tabSize.setDefault();
  remoteHost.setDefault();

  remoteHost.onChange.remove(remoteHostReCheck);

  is(tiltEnabled.value, tiltEnabledDefault, "tiltEnabled reset");
  is(tabSize.value, tabSizeDefault, "tabSize reset");
  is(remoteHost.value, remoteHostDefault, "remoteHost reset");

  // Cleanup
  prefBranch.setBoolPref("devtools.tilt.enabled", tiltEnabledOrig);
  prefBranch.setIntPref("devtools.editor.tabsize", tabSizeOrig);
  supportsString.data = remoteHostOrig;
  prefBranch.setComplexValue("devtools.debugger.remote-host",
          Components.interfaces.nsISupportsString,
          supportsString);

  yield helpers.closeTab(options);
}
