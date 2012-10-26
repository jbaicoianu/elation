/**
 * ElationEventBridge: bridge events from webapps to native apps
 *
 * Example: (assuming an existing UIWebView *myWebView):
 *   // First init bridge, bind to specified UIWebView, and subscribe to specified events
 *   [[ElationEventBridge defaultBridge] attachWebView:myWebView subscribe:@"user_login,user_logout"]
 * 
 *   // Then any class can add notification observers to watch for the "elation-event" notification
 *   @implementation MyClass 
 *   - (id) init {
 *
 *     [[NSNotificationCenter defaultCenter] addObserver:self
 *         selector:@selector(handleElationEvent:) 
 *         name:@"elation-event"];
 *   }
 *   - (void) handleElationEvent:(NSNotification *) notification {
 *     NSDictionary *event = notification.userInfo;
 *     if ([event.type isEqualToString:@"user_login"]) {
 *       NSDictionary *user = [event data];
 *       ...
 *     }
 *   }
 *   @end
 */

#import "ElationEventBridge.h"

@implementation ElationEventBridge
+ (ElationEventBridge *) defaultBridge {
    static ElationEventBridge *instance;
    @synchronized(self) {
        if (instance == nil) {
            instance = [[ElationEventBridge alloc] init];
        }
    }
    return instance;
}

- (BOOL) attachWebView:(UIWebView *)webView {
  [self.webViews addObject:webView];
  webView.delegate = self;
}
- (BOOL) attachWebView:(UIWebView *)webView subscribe:(NSString *)events {
  [self attachWebView:webView];
  [self subscribe:webView events:events]
}

- (BOOL) subscribe:(NSString *)events {
  // Register event subscription for every UIWebView we know about
  for (id webView in self.webViews) {
    [self subscribe:events webView:webView]
  }
}
- (BOOL) subscribe:(NSString *)events webView:(UIWebView *)webView {
  // Register event subscription for a specific UIWebView
  NSString *jscmd = [NSString stringWithFormat:@"elation.native.subscribe('%@');", events];
  if (webView.loading) {
    // TODO - queue any subscription requests made while the page was loading so they can be sent when it finishes
    return NO;
  } else {
    @try {
      [webView stringByEvaluatingJavaScriptFromString:jscmd];
    }
    @catch (NSException *e) {
      return NO;
    }
  }
  return YES;
}

- (BOOL) webView:(UIWebView *) webView shouldStartLoadWithRequest:(NSURLRequest *) request navigationType:(UIWebViewNavigationType) navigationType;
  // Webapp communicates with native app by loading a specially crafted URL in an iframe
  // URL format is: <bridgeName>:<eventType>/<eventData>
  if ([request.URL.scheme isEqualToString:kElationEventBridgeNotificationName]) {
    NSString *eventType = request.URL.host;
    NSString *eventDataStr = request.URL.path;
    NSMutableDictionary *event = [[NSMutableDictionary alloc] initWithObjectsAndKeys:@"type", eventType, nil];
    if (![eventDataStr isEqualToString:@"/"]) {
      // If there's any data after the initial slash, JSON decode it
      eventDataStr = [eventDataStr substringFromIndex:1];
      NSError *jsonError = nil;
      NSDictionary *jsonData = [NSJSONSerialization JSONObjectWithData:eventDataStr options:0 error:&jsonError];
      if (jsonData != nil) {
        [event setObject:jsonData forKey:@"data"];
      }
    }
    // post the notification to the notification center
    [[NSNotificationCenter defaultCenter] postNotificationName:kElationEventBridgeNotificationName object:nil userInfo:event];

    // prevent default handling
    return NO;
  }
  return YES;
}
/*
- (void)webViewDidFinishLoad:(UIWebView *)webView {
  // TODO - when the page reloads, we should call subscribe with any queued event names
}
*/
@end
