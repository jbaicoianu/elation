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
 *     [[NSNotificationCenter defaultCenter] addObserver:self
 *         selector:@selector(handleElationEvent:) 
 *         name:@"elation-event"];
 *   }
 *   - (void) handleElationEvent:(NSNotification *) notification {
 *     NSDictionary *event = notification.userInfo;
 *     if ([event.type isEqualToString:@"user_login"]) {
 *       NSDictionary *user = event.data;
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

- (void) attachWebView:(UIWebView *)webView {
  [self.webViews addObject:webView];
  webView.delegate = self;
}
- (void) attachWebView:(UIWebView *)webView subscribe:(NSString *)events {
  [self attachWebView:webView];
  [self subscribe:webView events:events]
}

- (BOOL) subscribe:(NSString *)events {
  // Register event subscription for every UIWebView we know about
  for (id webView in self.webViews) {
    [self subscribe:events webView:webView]
  }
  return YES;
}
- (BOOL) subscribe:(NSString *)events webView:(UIWebView *)webView {
  // Register event subscription for a specific UIWebView
  NSString *jscmd = [NSString stringWithFormat:@"elation.native.subscribe('%@');", events];
  if (webView.loading) {
    // queue any subscription requests made while the UIWebView was still loading
    // they will be sent when the webViewDidFinishLoad event is fired
    NSUInteger idx = [self.webViews indexOfObject:webView];
    if (idx != NSNotFound) {
      // NSMutableDictionary doesn't like integer keys, so convert to numeric
      NSNumber *nidx = [NSNumber numberWithInt:idx]; 
      NSString *queuedevents = [self.queues objectForKey:nidx];
      if (queuedevents == nil) {
        // no events queued yet
        queuedevents = events;
      } else {
        // if we already have queued events, append them with a comma separator
        queuedevents = [queuedevents stringByAppendingFormat:",%@", events ];
      }
      [self.queues setObject:queuedevents forKey:nidx];
    }
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
    [[NSNotificationCenter defaultCenter] postNotificationName:kElationEventBridgeNotificationName object:webView userInfo:event];

    // prevent default handling
    return NO;
  }
  return YES;
}
- (void)webViewDidFinishLoad:(UIWebView *)webView {
  // when the page reloads, call [self subscribe] with any queued event names
  NSUInteger idx = [self.webViews indexOfObject:webView];
  if (idx != NSNotFound) {
    // NSMutableDictionary doesn't like integer keys, so convert to numeric
    NSNumber *nidx = [NSNumber numberWithInt:idx]; 
    NSString *queuedEvents = [self.queues objectForKey:nidx];
    if (queuedEvents != nil && [queuedEvents length] > 0) {
      [self subscribe:queuedEvents webView:webView];
    }
  }
}
@end
