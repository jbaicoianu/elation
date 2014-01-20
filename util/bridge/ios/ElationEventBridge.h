#import <Foundation/Foundation.h>

// TODO: do we really need this const in global?
NSString *const kElationEventBridgeNotificationName = @"elation-event";

@interface ElationEventBridge : NSObject <UIWebViewDelegate>
{
}
@property (strong, nonatomic) NSMutableArray * webViews;
@property (strong, nonatomic) NSMutableDictionary * queues;

// Singleton
+ (id) defaultBridge;

- (id) init;

// add the specified webView, and subscribe to events if specified
- (void) attachWebView:(UIWebView *)webView;
- (void) attachWebView:(UIWebView *)webView subscribe:(NSString *)events;

// Notifies the UIWebView JS that you wish to receive the specified events
- (BOOL) subscribe:(NSString *)events;
- (BOOL) subscribe:(NSString *)events webView:(UIWebView *)webView;

- (BOOL) webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType;

@end
