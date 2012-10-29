NSString *const kElationEventBridgeNotificationName = @"elation-event";

@interface ElationEventBridge : NSObject <UIWebViewDelegate> 
{
}
@property (strong, nonatomic) NSMutableArray *webViews;
@property (strong, nonatomic) NSMutableDictionary *queues;

  // add the specified webView, and subscribe to events if specified
- (void) attachWebView:(UIWebView *)webView;
- (void) attachWebView:(UIWebView *)webView subscribe:(NSString *)events;

  // Notifies the UIWebView JS that you wish to receive the specified events
- (BOOL) subscribe:(NSString *)events;
- (BOOL) subscribe:(NSString *)events webView:(UIWebView *)webView;

  // static default instance
+ (ElationEventBridge *) defaultBridge;
@end
