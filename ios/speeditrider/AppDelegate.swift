import UIKit
import React
import React_RCTAppDelegate
import FirebaseCore
// Import FirebaseMessaging only when enabling push notifications
// import FirebaseMessaging
// import UserNotifications

@UIApplicationMain
class AppDelegate: RCTAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    // Initialize Firebase
    FirebaseApp.configure()

    // TODO: Uncomment the following block when upgrading to a paid Apple Developer account to enable push notifications
    /*
    // Request push notification permissions
    UNUserNotificationCenter.current().delegate = self
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      if let error = error {
        print("Failed to request authorization: \(error)")
      }
    }
    application.registerForRemoteNotifications()

    // Set Firebase Messaging delegate
    Messaging.messaging().delegate = self
    */

    // Configure React Native
    self.moduleName = "speeditride" // Set the module name for your app
    self.initialProps = [:] // Set initial props if needed

    // Initialize React Native using RCTAppDelegate
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Implement bundleURL to specify the JavaScript bundle location
  var bundleURL: URL! {
    get {
      #if DEBUG
      return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
      #else
      return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
      #endif
    }
  }

  // TODO: Uncomment the following methods when upgrading to a paid Apple Developer account to handle push notifications
  /*
  override func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Messaging.messaging().setAPNSToken(deviceToken, type: .unknown)
    print("APNs token: \(deviceToken.map { String(format: "%02.2hhx", $0) }.joined())")
  }

  override func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("Failed to register for remote notifications: \(error)")
  }

  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("FCM token: \(fcmToken ?? "nil")")
  }
  */
}
