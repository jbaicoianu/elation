NSString *const kElationEventBridgeNotificationName = @"elation-event";

@interface ElationEventBridge : NSObject <UIWebViewDelegate> 
{
}
@property (strong, nonatomic) NSMutableArray *webViews;

  // add the specified webView, and subscribe to events, if specified
- (BOOL) attachWebView:(UIWebView *)webView;
- (BOOL) attachWebView:(UIWebView *)webView subscribe:(NSString *)events;

  // Notifies the UIWebView JS that you wish to receive the specified events
- (BOOL) subscribe:(NSString *)events;
- (BOOL) subscribe:(NSString *)events webView:(UIWebView *)webView;

  // static default instance
+ (ElationEventBridge *) defaultBridge;
@end
