export function onStartup(context) {
  var TBColorPoolUIFramework_FrameworkPath = TBColorPoolUIFramework_FrameworkPath || COScript.currentCOScript().env().scriptURL.path().stringByDeletingLastPathComponent().stringByDeletingLastPathComponent();
  var TBColorPoolUIFramework_Log = TBColorPoolUIFramework_Log || log;
  (function() {
    var mocha = Mocha.sharedRuntime();
    var frameworkName = "TBColorPoolUIFramework";
    var directory = TBColorPoolUIFramework_FrameworkPath;
    if (mocha.valueForKey(frameworkName)) {
      TBColorPoolUIFramework_Log("😎 loadFramework: `" + frameworkName + "` already loaded.");
      return true;
 
    } else if (mocha.loadFrameworkWithName_inDirectory(frameworkName, directory)) {
      TBColorPoolUIFramework_Log("✅ loadFramework: `" + frameworkName + "` success!");
      mocha.setValue_forKey_(true, frameworkName);
      return true;
    } else {
      TBColorPoolUIFramework_Log("❌ loadFramework: `" + frameworkName + "` failed!: " + directory + ". Please define TBColorPoolUIFramework_FrameworkPath if you're trying to @import in a custom plugin");
      return false;
    }
  })();
 };
 export function showPanel(context) {
  TBColorPoolUIFramework.showPanel(context);
 };
 export function readColor(context) {
   TBColorPoolUIFramework.readColor(context);
  };