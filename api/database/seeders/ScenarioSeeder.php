<?php

namespace Database\Seeders;

use App\Models\Scenario;
use Illuminate\Database\Seeder;

class ScenarioSeeder extends Seeder
{
    public function run(): void
    {
        Scenario::truncate();

        $this->createPhishingEmailScenarios();

        $this->createFakeProfileScenarios();

        $this->createMessagingScenarios();

        $this->createMaliciousLinkScenarios();
    }

    private function createPhishingEmailScenarios(): void
    {
        Scenario::create([
            'title' => 'Urgent Bank Security Alert',
            'description' => 'You received this email claiming to be from your bank. Analyze it carefully.',
            'type' => 'phishing_email',
            'difficulty' => 'easy',
            'is_threat' => true,
            'content' => [
                'from' => 'security@bankofamerica-alerts.com',
                'subject' => 'URGENT: Suspicious Activity Detected on Your Account',
                'timestamp' => '2026-02-16 09:23:00',
            ],
            'html_content' => $this->bankPhishingEmailHtml(),
            'interactive_elements' => [
                ['id' => 'sender-address', 'type' => 'suspicious', 'description' => 'Fake domain mimicking real bank'],
                ['id' => 'verify-button', 'type' => 'malicious_link', 'description' => 'Links to phishing site'],
                ['id' => 'urgency-text', 'type' => 'social_engineering', 'description' => 'Creates false urgency'],
            ],
            'indicators' => [
                'Sender domain "bankofamerica-alerts.com" is not the official bank domain',
                'Creates urgency with "24 hours" deadline',
                'Generic greeting "Dear Customer" instead of your name',
                'Suspicious button link URL doesn\'t match official bank website',
                'Grammar issues and unusual formatting',
            ],
            'explanation' => 'This is a phishing email. Real banks never ask you to verify your account through email links. The sender domain is fake (bankofamerica-alerts.com vs bankofamerica.com), and the email uses urgency tactics to pressure you into clicking.',
            'is_active' => true,
        ]);

        Scenario::create([
            'title' => 'IT Department Password Reset',
            'description' => 'This email appears to be from your company\'s IT department. Is it legitimate?',
            'type' => 'phishing_email',
            'difficulty' => 'medium',
            'is_threat' => true,
            'content' => [
                'from' => 'it-support@company-helpdesk.net',
                'subject' => 'Password Expiration Notice - Action Required',
                'timestamp' => '2026-02-15 14:45:00',
            ],
            'html_content' => $this->itSupportPhishingEmailHtml(),
            'interactive_elements' => [
                ['id' => 'sender-address', 'type' => 'suspicious', 'description' => 'External domain posing as internal IT'],
                ['id' => 'reset-link', 'type' => 'malicious_link', 'description' => 'Links to credential harvesting page'],
                ['id' => 'microsoft-logo', 'type' => 'brand_impersonation', 'description' => 'Fake Microsoft branding'],
            ],
            'indicators' => [
                'Sender is from external domain, not your company\'s domain',
                'Generic "Employee" greeting',
                'Link URL goes to suspicious external site',
                'Threatening account lockout to create urgency',
                'IT department typically doesn\'t send password reset links via email',
            ],
            'explanation' => 'This is a credential phishing attempt. Legitimate IT departments don\'t send password reset links via email - they use official company portals. The sender domain is external, not your company\'s actual domain.',
            'is_active' => true,
        ]);

        Scenario::create([
            'title' => 'Amazon Order Confirmation',
            'description' => 'You recently ordered something online. Check if this confirmation email is legitimate.',
            'type' => 'phishing_email',
            'difficulty' => 'easy',
            'is_threat' => false,
            'content' => [
                'from' => 'auto-confirm@amazon.com',
                'subject' => 'Your Amazon.com order #112-4567890-1234567',
                'timestamp' => '2026-02-14 16:30:00',
            ],
            'html_content' => $this->legitimateAmazonEmailHtml(),
            'interactive_elements' => [
                ['id' => 'sender-address', 'type' => 'legitimate', 'description' => 'Verified Amazon domain'],
                ['id' => 'order-details', 'type' => 'informational', 'description' => 'Specific order information'],
                ['id' => 'track-button', 'type' => 'safe_link', 'description' => 'Links to official Amazon site'],
            ],
            'indicators' => [
                'Legitimate amazon.com domain',
                'Specific order number you recognize',
                'No urgent action required or threats',
                'Professional formatting consistent with Amazon emails',
                'Links point to official amazon.com domain',
            ],
            'explanation' => 'This is a legitimate order confirmation. The sender is from the official amazon.com domain, contains specific order details, and doesn\'t pressure you to take immediate action.',
            'is_active' => true,
        ]);

        Scenario::create([
            'title' => 'Congratulations! You\'ve Won!',
            'description' => 'An exciting email arrived announcing you\'ve won a prize. Too good to be true?',
            'type' => 'phishing_email',
            'difficulty' => 'easy',
            'is_threat' => true,
            'content' => [
                'from' => 'prizes@international-lottery-winners.org',
                'subject' => '🎉 CONGRATULATIONS! You\'ve Won $1,500,000 USD!!!',
                'timestamp' => '2026-02-13 03:15:00',
            ],
            'html_content' => $this->prizeScamEmailHtml(),
            'interactive_elements' => [
                ['id' => 'claim-button', 'type' => 'malicious_link', 'description' => 'Leads to scam site'],
                ['id' => 'prize-amount', 'type' => 'social_engineering', 'description' => 'Unrealistic prize to lure victims'],
                ['id' => 'urgency-notice', 'type' => 'social_engineering', 'description' => 'Time pressure tactic'],
            ],
            'indicators' => [
                'You never entered any lottery',
                'Excessive use of emojis and capital letters',
                'Unrealistic prize amount',
                'Request for personal information',
                'Suspicious sender domain',
                'Sent at unusual hours (3:15 AM)',
            ],
            'explanation' => 'This is a classic lottery/prize scam. You can\'t win a lottery you never entered. These scams collect personal information or advance fees from victims.',
            'is_active' => true,
        ]);
    }

    private function createFakeProfileScenarios(): void
    {
        Scenario::create([
            'title' => 'LinkedIn Connection Request',
            'description' => 'Someone wants to connect with you on LinkedIn. Review their profile.',
            'type' => 'fake_profile',
            'difficulty' => 'medium',
            'is_threat' => true,
            'content' => [
                'platform' => 'linkedin',
                'display_name' => 'Sarah Mitchell',
                'username' => 'sarah-mitchell-recruiter',
            ],
            'html_content' => $this->fakeLinkedInProfileHtml(),
            'interactive_elements' => [
                ['id' => 'profile-photo', 'type' => 'suspicious', 'description' => 'AI-generated or stock photo'],
                ['id' => 'connection-count', 'type' => 'red_flag', 'description' => 'Suspiciously low connections'],
                ['id' => 'message-link', 'type' => 'social_engineering', 'description' => 'Unsolicited job offer with link'],
            ],
            'indicators' => [
                'Profile created very recently (2 weeks ago)',
                'Very few connections for a "Senior Recruiter"',
                'Generic stock photo profile picture',
                'Unsolicited message with job opportunity link',
                'Vague work history with prestigious company names',
            ],
            'explanation' => 'This is a fake LinkedIn profile likely used for recruitment scams or credential harvesting. The low connection count, recent creation date, and unsolicited job offer with external links are red flags.',
            'is_active' => true,
        ]);

        Scenario::create([
            'title' => 'Instagram Follow Request',
            'description' => 'A classmate from college wants to follow you. Is this profile real?',
            'type' => 'fake_profile',
            'difficulty' => 'medium',
            'is_threat' => false,
            'content' => [
                'platform' => 'instagram',
                'display_name' => 'Mike Johnson',
                'username' => 'mikej_photography',
            ],
            'html_content' => $this->legitimateInstagramProfileHtml(),
            'interactive_elements' => [
                ['id' => 'profile-photo', 'type' => 'legitimate', 'description' => 'Authentic personal photo'],
                ['id' => 'post-grid', 'type' => 'informational', 'description' => 'Consistent posting history'],
                ['id' => 'mutual-friends', 'type' => 'verification', 'description' => 'Shared connections'],
            ],
            'indicators' => [
                'Account has been active for 3+ years',
                'Consistent posting history with personal photos',
                'Reasonable follower/following ratio',
                'Mutual friends you recognize',
                'Bio matches what you know about them',
            ],
            'explanation' => 'This appears to be a legitimate profile. The account has a long history, consistent personal content, mutual connections, and no suspicious behavior.',
            'is_active' => true,
        ]);

        Scenario::create([
            'title' => 'Facebook Friend Request',
            'description' => 'Someone claiming to be a friend\'s relative sent you a request.',
            'type' => 'fake_profile',
            'difficulty' => 'hard',
            'is_threat' => true,
            'content' => [
                'platform' => 'facebook',
                'display_name' => 'Emma Rodriguez',
                'username' => 'emma.rodriguez.98765',
            ],
            'html_content' => $this->fakeFacebookProfileHtml(),
            'interactive_elements' => [
                ['id' => 'profile-photo', 'type' => 'suspicious', 'description' => 'Stolen photo from another account'],
                ['id' => 'timeline', 'type' => 'red_flag', 'description' => 'All posts in last 48 hours'],
                ['id' => 'message-content', 'type' => 'social_engineering', 'description' => 'Requests money via crypto'],
            ],
            'indicators' => [
                'Account created just 2 days ago',
                'All posts made within 48 hours',
                'Claims to know your friend but details don\'t match',
                'Immediately asks about cryptocurrency',
                'Profile photos look professionally taken (possibly stolen)',
            ],
            'explanation' => 'This is a fake profile, likely created to build trust and eventually scam you. The recent account creation, rapid posting to appear legitimate, and immediate interest in cryptocurrency are classic signs.',
            'is_active' => true,
        ]);
    }

    private function createMessagingScenarios(): void
    {
        Scenario::create([
            'title' => 'WhatsApp Message from Unknown Number',
            'description' => 'You received this message from an unknown number claiming to be from your bank.',
            'type' => 'messaging',
            'difficulty' => 'easy',
            'is_threat' => true,
            'content' => [
                'platform' => 'whatsapp',
                'sender' => '+1 (555) 123-4567',
                'sender_name' => 'Unknown',
            ],
            'html_content' => $this->whatsappScamMessageHtml(),
            'interactive_elements' => [
                ['id' => 'sender-number', 'type' => 'suspicious', 'description' => 'Unknown number claiming to be bank'],
                ['id' => 'link', 'type' => 'malicious_link', 'description' => 'Shortened URL hiding destination'],
                ['id' => 'urgency', 'type' => 'social_engineering', 'description' => 'Account suspension threat'],
            ],
            'indicators' => [
                'Banks don\'t contact customers via WhatsApp',
                'Unknown phone number',
                'Shortened link hiding the real destination',
                'Urgent account suspension threat',
                'Requests clicking a link to "verify" account',
            ],
            'explanation' => 'This is a smishing (SMS phishing) attempt via WhatsApp. Banks never contact customers through WhatsApp or ask them to click links to verify accounts.',
            'is_active' => true,
        ]);

        Scenario::create([
            'title' => 'iMessage from Saved Contact',
            'description' => 'Your friend sent you a message about weekend plans.',
            'type' => 'messaging',
            'difficulty' => 'easy',
            'is_threat' => false,
            'content' => [
                'platform' => 'imessage',
                'sender' => 'Alex Chen',
                'sender_name' => 'Alex Chen',
            ],
            'html_content' => $this->legitimateIMessageHtml(),
            'interactive_elements' => [
                ['id' => 'sender-name', 'type' => 'legitimate', 'description' => 'Known saved contact'],
                ['id' => 'message-content', 'type' => 'informational', 'description' => 'Normal conversation topic'],
                ['id' => 'conversation-history', 'type' => 'verification', 'description' => 'Ongoing conversation thread'],
            ],
            'indicators' => [
                'Message from a saved contact you know',
                'Normal conversational topic',
                'Part of an ongoing conversation',
                'No links or requests for money/info',
                'Writing style matches the person you know',
            ],
            'explanation' => 'This is a legitimate message from a friend. It\'s from a saved contact, continues a normal conversation, and doesn\'t contain any suspicious requests or links.',
            'is_active' => true,
        ]);

        Scenario::create([
            'title' => 'SMS Virus Warning',
            'description' => 'You received a text message warning about a virus on your phone.',
            'type' => 'messaging',
            'difficulty' => 'medium',
            'is_threat' => true,
            'content' => [
                'platform' => 'sms',
                'sender' => '5551234',
                'sender_name' => 'Unknown',
            ],
            'html_content' => $this->smsVirusScamHtml(),
            'interactive_elements' => [
                ['id' => 'sender-number', 'type' => 'suspicious', 'description' => 'Short code pretending to be official'],
                ['id' => 'download-link', 'type' => 'malicious_link', 'description' => 'Links to malware download'],
                ['id' => 'virus-warning', 'type' => 'social_engineering', 'description' => 'Fake virus scare tactic'],
            ],
            'indicators' => [
                'Unsolicited virus warning',
                'Short code sender (not Apple or Google)',
                'Link to download "security" app',
                'Creates panic about device security',
                'Apple/Google don\'t send virus warnings via SMS',
            ],
            'explanation' => 'This is a tech support scam. Neither Apple nor Google send virus warnings via SMS. The "security app" link likely downloads malware.',
            'is_active' => true,
        ]);
    }

    private function createMaliciousLinkScenarios(): void
    {
        Scenario::create([
            'title' => 'PayPal Payment Link',
            'description' => 'Someone sent you this link to receive a PayPal payment.',
            'type' => 'malicious_link',
            'difficulty' => 'medium',
            'is_threat' => true,
            'content' => [
                'displayed_url' => 'https://www.paypa1.com/receive/payment',
                'actual_url' => 'https://www.paypa1.com/receive/payment',
                'context' => 'Received in an email about an online sale',
            ],
            'html_content' => $this->typosquattingLinkHtml(),
            'interactive_elements' => [
                ['id' => 'url-display', 'type' => 'suspicious', 'description' => 'Typosquatting domain (1 instead of l)'],
                ['id' => 'accept-button', 'type' => 'malicious_link', 'description' => 'Leads to credential harvesting'],
            ],
            'indicators' => [
                'Domain uses "paypa1" with number 1 instead of letter l',
                'URL typosquatting a legitimate brand',
                'Unsolicited payment offer',
                'Site may look identical to real PayPal',
            ],
            'explanation' => 'This is a typosquatting attack. The domain "paypa1.com" uses the number 1 instead of the letter l to trick users. Always carefully check URLs before entering credentials.',
            'is_active' => true,
        ]);

        Scenario::create([
            'title' => 'Bit.ly Link from Colleague',
            'description' => 'Your colleague shared a document link on Slack.',
            'type' => 'malicious_link',
            'difficulty' => 'hard',
            'is_threat' => false,
            'content' => [
                'displayed_url' => 'https://bit.ly/project-docs-q1',
                'actual_url' => 'https://docs.google.com/document/d/1abc123/edit',
                'context' => 'Shared in your team Slack channel by your manager',
            ],
            'html_content' => $this->legitimateShortenedLinkHtml(),
            'interactive_elements' => [
                ['id' => 'url-display', 'type' => 'informational', 'description' => 'Common link shortener'],
                ['id' => 'preview-button', 'type' => 'safe_action', 'description' => 'Preview shows Google Docs destination'],
                ['id' => 'sender-context', 'type' => 'verification', 'description' => 'From known colleague in team channel'],
            ],
            'indicators' => [
                'Shared by a known colleague in a verified channel',
                'Link preview shows legitimate Google Docs destination',
                'Context makes sense for your work',
                'You can verify with the sender if unsure',
            ],
            'explanation' => 'This shortened link is safe. It was shared by a verified colleague in your team channel, and the preview shows it goes to Google Docs. When in doubt, you can always ask the sender to confirm.',
            'is_active' => true,
        ]);
    }


    private function bankPhishingEmailHtml(): string
    {
        return <<<'HTML'
<div class="bg-base-100 rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
    <!-- Email Header -->
    <div class="bg-red-700 text-white px-6 py-4">
        <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span class="font-bold text-xl">Bank of America</span>
        </div>
    </div>
    
    <!-- Email Info Bar -->
    <div class="bg-base-200 px-6 py-3 border-b border-base-300">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <div class="flex items-center gap-2">
                <span class="font-medium text-base-content/70">From:</span>
                <span id="sender-address" class="text-base-content font-mono text-xs bg-base-300 px-2 py-1 rounded" data-interactive="true">
                    security@bankofamerica-alerts.com
                </span>
            </div>
            <div class="hidden sm:block text-base-content/30">|</div>
            <div class="text-base-content/60">Today, 9:23 AM</div>
        </div>
        <div class="mt-2 flex items-center gap-2">
            <span class="font-medium text-base-content/70">Subject:</span>
            <span class="text-error font-semibold">URGENT: Suspicious Activity Detected on Your Account</span>
        </div>
    </div>
    
    <!-- Email Body -->
    <div class="p-6 space-y-4">
        <div class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span id="urgency-text" data-interactive="true">Security Alert: Immediate Action Required</span>
        </div>
        
        <p class="text-base-content">Dear Customer,</p>
        
        <p class="text-base-content/80">
            We have detected unusual activity on your Bank of America account. For your security, we have temporarily limited access to sensitive account features.
        </p>
        
        <div class="bg-base-200 rounded-lg p-4 border-l-4 border-warning">
            <p class="font-semibold text-base-content mb-2">What happened:</p>
            <ul class="list-disc list-inside text-base-content/80 space-y-1 text-sm">
                <li>Multiple login attempts from unknown location</li>
                <li>Suspicious transaction of $892.45 flagged</li>
                <li>Account access from new device detected</li>
            </ul>
        </div>
        
        <p class="text-base-content/80">
            <strong class="text-error">You must verify your identity within 24 hours</strong> or your account will be permanently suspended.
        </p>
        
        <div class="text-center py-4">
            <button id="verify-button" class="btn btn-error btn-lg gap-2" data-interactive="true" data-action="click_suspicious_link">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Verify My Account Now
            </button>
            <p class="text-xs text-base-content/50 mt-2">Link: http://bankofamerica-secure-verify.com/auth</p>
        </div>
        
        <div class="divider"></div>
        
        <p class="text-sm text-base-content/60">
            If you did not make these requests, please verify immediately to protect your account.
        </p>
        
        <p class="text-sm text-base-content/60">
            Sincerely,<br>
            Bank of America Security Team
        </p>
    </div>
    
    <!-- Email Footer -->
    <div class="bg-base-200 px-6 py-4 text-xs text-base-content/50">
        <p>© 2026 Bank of America Corporation. All rights reserved.</p>
        <p class="mt-1">This email was sent to protect your account security.</p>
    </div>
</div>
HTML;
    }

    private function itSupportPhishingEmailHtml(): string
    {
        return <<<'HTML'
<div class="bg-base-100 rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
    <!-- Email Header with Microsoft branding -->
    <div class="bg-[#0078d4] text-white px-6 py-4">
        <div class="flex items-center gap-3">
            <div id="microsoft-logo" data-interactive="true" class="grid grid-cols-2 gap-0.5 w-6 h-6">
                <div class="bg-[#f25022]"></div>
                <div class="bg-[#7fba00]"></div>
                <div class="bg-[#00a4ef]"></div>
                <div class="bg-[#ffb900]"></div>
            </div>
            <span class="font-semibold">Microsoft 365</span>
        </div>
    </div>
    
    <!-- Email Info Bar -->
    <div class="bg-base-200 px-6 py-3 border-b border-base-300">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <div class="flex items-center gap-2">
                <span class="font-medium text-base-content/70">From:</span>
                <span id="sender-address" class="text-base-content font-mono text-xs bg-base-300 px-2 py-1 rounded" data-interactive="true">
                    it-support@company-helpdesk.net
                </span>
            </div>
        </div>
        <div class="mt-2">
            <span class="font-medium text-base-content/70">Subject:</span>
            <span class="text-base-content ml-2">Password Expiration Notice - Action Required</span>
        </div>
    </div>
    
    <!-- Email Body -->
    <div class="p-6 space-y-4">
        <p class="text-base-content">Dear Employee,</p>
        
        <p class="text-base-content/80">
            Your Microsoft 365 password is set to expire in <strong class="text-warning">24 hours</strong>. 
            To maintain access to your email, Teams, and other company resources, please update your password immediately.
        </p>
        
        <div class="bg-warning/10 border border-warning/30 rounded-lg p-4">
            <div class="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <p class="font-semibold text-base-content">Password Policy Reminder</p>
                    <ul class="text-sm text-base-content/70 mt-2 space-y-1">
                        <li>• Minimum 12 characters</li>
                        <li>• Must include uppercase, lowercase, and numbers</li>
                        <li>• Cannot reuse last 5 passwords</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="text-center py-4">
            <a id="reset-link" href="#" class="btn btn-primary gap-2" data-interactive="true" data-action="click_suspicious_link">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Reset Password Now
            </a>
            <p class="text-xs text-base-content/50 mt-2 font-mono">https://microsoft-365-password.company-helpdesk.net/reset</p>
        </div>
        
        <div class="bg-error/10 border border-error/30 rounded-lg p-3 text-sm">
            <p class="text-error font-semibold">⚠️ Important:</p>
            <p class="text-base-content/80">Failure to reset your password will result in immediate account lockout and loss of access to all company resources.</p>
        </div>
        
        <div class="divider"></div>
        
        <p class="text-sm text-base-content/60">
            Best regards,<br>
            IT Support Team
        </p>
    </div>
    
    <!-- Email Footer -->
    <div class="bg-base-200 px-6 py-3 text-xs text-base-content/50">
        <p>This is an automated message from your IT department.</p>
    </div>
</div>
HTML;
    }

    private function legitimateAmazonEmailHtml(): string
    {
        return <<<'HTML'
<div class="bg-base-100 rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
    <!-- Amazon Header -->
    <div class="bg-[#232f3e] text-white px-6 py-4">
        <div class="flex items-center gap-2">
            <svg class="h-8 w-24" viewBox="0 0 603 182" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M374.011 142.011C338.681 168.041 287.101 182.001 243.181 182.001C181.151 182.001 125.041 159.161 82.3506 121.501C79.0806 118.561 82.0006 114.461 85.9206 116.751C131.181 143.301 187.301 159.161 245.281 159.161C284.101 159.161 326.711 151.331 366.001 135.001C371.711 132.531 376.601 138.711 374.011 142.011Z" fill="#FF9900"/>
                <path d="M382.831 131.851C378.381 126.141 352.821 129.181 341.331 130.521C337.881 130.941 337.361 127.961 340.451 125.791C360.881 111.371 394.561 115.511 398.361 120.281C402.171 125.081 397.251 158.761 378.141 174.911C375.271 177.351 372.531 176.071 373.831 172.881C378.031 162.461 387.311 137.591 382.831 131.851Z" fill="#FF9900"/>
                <path d="M341.921 21.3312V6.58117C341.921 4.29117 343.671 2.77117 345.731 2.77117H407.481C409.631 2.77117 411.381 4.33117 411.381 6.58117V19.3212C411.341 21.4812 409.491 24.2712 406.311 28.6712L374.011 75.7712C385.961 75.4712 398.551 77.1912 409.311 83.2512C411.731 84.6312 412.391 86.6712 412.571 88.6512V104.311C412.571 106.331 410.351 108.701 408.001 107.461C387.481 96.5712 359.761 95.3712 337.161 107.601C335.011 108.761 332.751 106.421 332.751 104.401V89.5212C332.751 87.2712 332.791 83.3112 335.061 79.9012L372.691 25.4712H345.821C343.671 25.4712 341.921 23.9512 341.921 21.3312Z" fill="white"/>
            </svg>
        </div>
    </div>
    
    <!-- Email Info -->
    <div class="bg-base-200 px-6 py-3 border-b border-base-300">
        <div class="flex items-center gap-2 text-sm">
            <span class="font-medium text-base-content/70">From:</span>
            <span id="sender-address" class="text-base-content font-mono text-xs bg-base-300 px-2 py-1 rounded" data-interactive="true">
                auto-confirm@amazon.com
            </span>
            <span class="badge badge-success badge-sm gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Verified
            </span>
        </div>
        <div class="mt-2 text-sm">
            <span class="font-medium text-base-content/70">Subject:</span>
            <span class="text-base-content ml-2">Your Amazon.com order #112-4567890-1234567</span>
        </div>
    </div>
    
    <!-- Email Body -->
    <div class="p-6 space-y-4">
        <div class="flex items-center gap-3 p-4 bg-success/10 rounded-lg border border-success/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
                <p class="font-semibold text-base-content">Order Confirmed</p>
                <p class="text-sm text-base-content/70">Thank you for shopping with us!</p>
            </div>
        </div>
        
        <p class="text-base-content">Hello John,</p>
        
        <p class="text-base-content/80">
            We're confirming that we received your order. We'll send you another email when your items ship.
        </p>
        
        <!-- Order Details -->
        <div id="order-details" data-interactive="true" class="border border-base-300 rounded-lg overflow-hidden">
            <div class="bg-base-200 px-4 py-2 font-semibold text-sm">Order Details</div>
            <div class="p-4 space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-base-content/70">Order #:</span>
                    <span class="font-mono">112-4567890-1234567</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-base-content/70">Order Date:</span>
                    <span>February 14, 2026</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-base-content/70">Delivery:</span>
                    <span class="text-success font-medium">February 17-19</span>
                </div>
            </div>
        </div>
        
        <!-- Item -->
        <div class="flex gap-4 p-4 border border-base-300 rounded-lg">
            <div class="w-20 h-20 bg-base-200 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            </div>
            <div class="flex-1">
                <p class="font-medium text-base-content">Apple AirPods Pro (2nd Generation)</p>
                <p class="text-sm text-base-content/70">Qty: 1</p>
                <p class="text-sm font-semibold mt-1">$249.00</p>
            </div>
        </div>
        
        <div class="text-center py-2">
            <a id="track-button" href="#" class="btn btn-primary btn-sm gap-2" data-interactive="true" data-action="click_safe_link">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Track Package
            </a>
            <p class="text-xs text-base-content/50 mt-2">amazon.com/orders/112-4567890-1234567</p>
        </div>
    </div>
    
    <!-- Footer -->
    <div class="bg-base-200 px-6 py-4 text-xs text-base-content/50">
        <p>This email was sent from a notification-only address. Please do not reply.</p>
        <p class="mt-1">© 2026 Amazon.com, Inc. All rights reserved.</p>
    </div>
</div>
HTML;
    }

    private function prizeScamEmailHtml(): string
    {
        return <<<'HTML'
<div class="bg-base-100 rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
    <!-- Gaudy Header -->
    <div class="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black px-6 py-6 text-center">
        <div class="text-4xl mb-2">🎉🏆🎊</div>
        <h1 class="text-2xl font-black">CONGRATULATIONS!!!</h1>
        <p class="text-lg font-bold mt-1">YOU ARE A WINNER!</p>
    </div>
    
    <!-- Email Info -->
    <div class="bg-base-200 px-6 py-3 border-b border-base-300">
        <div class="text-sm">
            <span class="font-medium text-base-content/70">From:</span>
            <span class="text-base-content font-mono text-xs bg-base-300 px-2 py-1 rounded ml-2">
                prizes@international-lottery-winners.org
            </span>
        </div>
        <div class="mt-2 text-sm">
            <span class="font-medium text-base-content/70">Subject:</span>
            <span class="text-base-content ml-2 font-bold">🎉 CONGRATULATIONS! You've Won $1,500,000 USD!!!</span>
        </div>
    </div>
    
    <!-- Body -->
    <div class="p-6 space-y-4">
        <div id="prize-amount" data-interactive="true" class="text-center p-6 bg-gradient-to-b from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-xl border-2 border-yellow-400 border-dashed">
            <p class="text-sm uppercase tracking-wider text-base-content/60">You have won</p>
            <p class="text-4xl font-black text-success my-2">$1,500,000.00</p>
            <p class="text-sm text-base-content/70">ONE MILLION FIVE HUNDRED THOUSAND US DOLLARS</p>
        </div>
        
        <p class="text-base-content">Dear Lucky Winner,</p>
        
        <p class="text-base-content/80">
            We are pleased to inform you that your email address was selected in our INTERNATIONAL EMAIL LOTTERY DRAW held on February 10th, 2026. Your email was attached to ticket number <strong>56475600545 188</strong> with serial number <strong>5765-5765</strong> and drew lucky numbers <strong>7-14-21-35-42</strong>.
        </p>
        
        <div class="bg-warning/20 border border-warning/50 rounded-lg p-4">
            <p id="urgency-notice" data-interactive="true" class="font-bold text-warning-content">
                ⚠️ URGENT: You must claim your prize within 7 DAYS or it will be forfeited!
            </p>
        </div>
        
        <p class="text-base-content/80">
            To claim your prize, you must provide the following information:
        </p>
        
        <ul class="list-disc list-inside text-base-content/80 space-y-1 bg-base-200 p-4 rounded-lg">
            <li>Full Name</li>
            <li>Date of Birth</li>
            <li>Home Address</li>
            <li>Phone Number</li>
            <li>Bank Account Details (for wire transfer)</li>
            <li>Copy of ID/Passport</li>
        </ul>
        
        <div class="text-center py-4">
            <button id="claim-button" class="btn btn-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 border-none gap-2" data-interactive="true" data-action="click_suspicious_link">
                🏆 CLAIM YOUR PRIZE NOW 🏆
            </button>
        </div>
        
        <p class="text-sm text-base-content/60 text-center">
            For security purposes, keep this email confidential.
        </p>
        
        <div class="divider"></div>
        
        <p class="text-sm text-base-content/60">
            Congratulations once again!<br>
            <strong>Mrs. Patricia Williams</strong><br>
            Claims Director<br>
            International Lottery Commission
        </p>
    </div>
    
    <div class="bg-yellow-50 dark:bg-yellow-900/10 px-6 py-3 text-xs text-base-content/50 text-center">
        <p>🎰 International Lottery Winners Organization 🎰</p>
    </div>
</div>
HTML;
    }

    private function fakeLinkedInProfileHtml(): string
    {
        return <<<'HTML'
<div class="bg-base-100 rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
    <!-- LinkedIn Header -->
    <div class="bg-[#0a66c2] h-24 relative">
        <div class="absolute -bottom-12 left-6">
            <div id="profile-photo" data-interactive="true" class="w-24 h-24 rounded-full border-4 border-base-100 bg-base-200 flex items-center justify-center overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
        </div>
    </div>
    
    <!-- Profile Info -->
    <div class="pt-16 px-6 pb-4">
        <h2 class="text-xl font-bold text-base-content">Sarah Mitchell</h2>
        <p class="text-base-content/70">Senior Recruiter at Fortune 500 Company</p>
        <p class="text-sm text-base-content/50 mt-1">San Francisco Bay Area</p>
        
        <div id="connection-count" data-interactive="true" class="flex items-center gap-4 mt-4 text-sm">
            <span class="text-[#0a66c2] font-medium">23 connections</span>
            <span class="text-base-content/50">•</span>
            <span class="text-base-content/50">Joined 2 weeks ago</span>
        </div>
        
        <div class="flex gap-2 mt-4">
            <button class="btn btn-primary btn-sm flex-1 bg-[#0a66c2] border-none hover:bg-[#004182]">Connect</button>
            <button class="btn btn-outline btn-sm flex-1">Message</button>
        </div>
    </div>
    
    <!-- About Section -->
    <div class="px-6 py-4 border-t border-base-200">
        <h3 class="font-semibold text-base-content mb-2">About</h3>
        <p class="text-sm text-base-content/70">
            Passionate recruiter with 10+ years of experience placing top talent at leading tech companies. 
            Currently looking for exceptional candidates for exclusive opportunities. 
            DM me to learn more! 🚀
        </p>
    </div>
    
    <!-- Experience -->
    <div class="px-6 py-4 border-t border-base-200">
        <h3 class="font-semibold text-base-content mb-3">Experience</h3>
        <div class="flex gap-3">
            <div class="w-12 h-12 bg-base-200 rounded flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            </div>
            <div>
                <p class="font-medium text-base-content">Senior Recruiter</p>
                <p class="text-sm text-base-content/70">Fortune 500 Company</p>
                <p class="text-xs text-base-content/50">Jan 2026 - Present • 2 mos</p>
            </div>
        </div>
    </div>
    
    <!-- Message Preview -->
    <div class="px-6 py-4 border-t border-base-200 bg-base-200/50">
        <p class="text-sm font-medium text-base-content mb-2">Message from Sarah:</p>
        <div id="message-link" data-interactive="true" class="bg-base-100 rounded-lg p-4 text-sm text-base-content/80 border border-base-300">
            <p>Hi there! 👋</p>
            <p class="mt-2">
                I came across your profile and I'm impressed with your background! I have an exciting opportunity 
                at a top tech company with a salary of $250k+. 
            </p>
            <p class="mt-2">
                Click here to apply: <span class="text-[#0a66c2] underline cursor-pointer">bit.ly/dream-job-apply</span>
            </p>
            <p class="mt-2">Looking forward to hearing from you! 💼</p>
        </div>
    </div>
</div>
HTML;
    }

    private function legitimateInstagramProfileHtml(): string
    {
        return <<<'HTML'
<div class="bg-base-100 rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
    <!-- Instagram Header -->
    <div class="bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] p-0.5">
        <div class="bg-base-100 px-4 py-3">
            <div class="flex items-center justify-between">
                <svg class="h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                </svg>
                <span class="font-semibold">Instagram</span>
                <div class="w-8"></div>
            </div>
        </div>
    </div>
    
    <!-- Profile Section -->
    <div class="p-4">
        <div class="flex items-center gap-4">
            <div id="profile-photo" data-interactive="true" class="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
                <div class="w-full h-full rounded-full bg-base-200 flex items-center justify-center text-2xl">
                    📷
                </div>
            </div>
            <div class="flex-1">
                <h2 class="font-bold text-base-content">mikej_photography</h2>
                <p class="text-sm text-base-content/70">Mike Johnson</p>
            </div>
        </div>
        
        <!-- Stats -->
        <div class="flex justify-around mt-4 text-center">
            <div>
                <p class="font-bold text-base-content">847</p>
                <p class="text-xs text-base-content/60">posts</p>
            </div>
            <div>
                <p class="font-bold text-base-content">2,341</p>
                <p class="text-xs text-base-content/60">followers</p>
            </div>
            <div>
                <p class="font-bold text-base-content">892</p>
                <p class="text-xs text-base-content/60">following</p>
            </div>
        </div>
        
        <!-- Bio -->
        <div class="mt-4 text-sm">
            <p class="text-base-content">📍 Brooklyn, NY</p>
            <p class="text-base-content/80">Freelance photographer | Nature & Urban</p>
            <p class="text-base-content/80">Class of 2019 - State University</p>
            <p class="text-[#3b82f6]">mikejohnsonphoto.com</p>
        </div>
        
        <!-- Mutual Friends -->
        <div id="mutual-friends" data-interactive="true" class="mt-4 flex items-center gap-2 text-sm text-base-content/70">
            <div class="flex -space-x-2">
                <div class="w-6 h-6 rounded-full bg-base-300 border-2 border-base-100"></div>
                <div class="w-6 h-6 rounded-full bg-base-300 border-2 border-base-100"></div>
                <div class="w-6 h-6 rounded-full bg-base-300 border-2 border-base-100"></div>
            </div>
            <span>Followed by <strong>Alex</strong>, <strong>Jordan</strong>, and 12 others</span>
        </div>
        
        <div class="flex gap-2 mt-4">
            <button class="btn btn-primary btn-sm flex-1">Follow Back</button>
            <button class="btn btn-outline btn-sm flex-1">Message</button>
        </div>
    </div>
    
    <!-- Post Grid -->
    <div id="post-grid" data-interactive="true" class="border-t border-base-200">
        <div class="grid grid-cols-3 gap-0.5">
            <div class="aspect-square bg-base-200 flex items-center justify-center text-2xl">🌆</div>
            <div class="aspect-square bg-base-200 flex items-center justify-center text-2xl">🌳</div>
            <div class="aspect-square bg-base-200 flex items-center justify-center text-2xl">🌅</div>
            <div class="aspect-square bg-base-200 flex items-center justify-center text-2xl">🏙️</div>
            <div class="aspect-square bg-base-200 flex items-center justify-center text-2xl">🌊</div>
            <div class="aspect-square bg-base-200 flex items-center justify-center text-2xl">🏔️</div>
        </div>
    </div>
    
    <!-- Account Info -->
    <div class="px-4 py-3 bg-base-200/50 text-xs text-base-content/50">
        <p>Account created: March 2019 • 847 posts over 7 years</p>
    </div>
</div>
HTML;
    }

    private function fakeFacebookProfileHtml(): string
    {
        return <<<'HTML'
<div class="bg-base-100 rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
    <!-- Facebook Header -->
    <div class="bg-[#1877f2] px-4 py-3">
        <div class="flex items-center justify-between text-white">
            <span class="text-xl font-bold">facebook</span>
            <div class="flex gap-2">
                <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Cover Photo -->
    <div class="h-32 bg-gradient-to-r from-base-200 to-base-300 relative">
        <div class="absolute -bottom-10 left-4">
            <div id="profile-photo" data-interactive="true" class="w-24 h-24 rounded-full border-4 border-base-100 bg-base-100 overflow-hidden">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E" 
                     alt="Profile" class="w-full h-full object-cover" />
            </div>
        </div>
    </div>
    
    <!-- Profile Info -->
    <div class="pt-12 px-4 pb-4">
        <h2 class="text-xl font-bold text-base-content">Emma Rodriguez</h2>
        <p class="text-sm text-base-content/60">@emma.rodriguez.98765</p>
        
        <div class="flex items-center gap-2 mt-2 text-sm text-base-content/70">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Joined February 14, 2026</span>
            <span class="badge badge-warning badge-xs">New Account</span>
        </div>
        
        <div class="flex gap-4 mt-3 text-sm">
            <span><strong>47</strong> friends</span>
        </div>
        
        <div class="flex gap-2 mt-4">
            <button class="btn btn-primary btn-sm flex-1 bg-[#1877f2] border-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Confirm Request
            </button>
            <button class="btn btn-outline btn-sm">Delete</button>
        </div>
    </div>
    
    <!-- Recent Posts Timeline -->
    <div id="timeline" data-interactive="true" class="border-t border-base-200">
        <div class="px-4 py-3">
            <h3 class="font-semibold text-base-content mb-3">Recent Posts</h3>
            
            <!-- Post 1 -->
            <div class="border border-base-200 rounded-lg p-3 mb-3">
                <div class="flex items-center gap-2 text-xs text-base-content/50 mb-2">
                    <span>2 hours ago</span>
                </div>
                <p class="text-sm text-base-content">Just moved to a new city! Looking to connect with new friends 🏙️ Anyone know any good restaurants?</p>
            </div>
            
            <!-- Post 2 -->
            <div class="border border-base-200 rounded-lg p-3 mb-3">
                <div class="flex items-center gap-2 text-xs text-base-content/50 mb-2">
                    <span>8 hours ago</span>
                </div>
                <p class="text-sm text-base-content">Excited to be on Facebook! Can't wait to reconnect with everyone 😊</p>
            </div>
            
            <!-- Post 3 -->
            <div class="border border-base-200 rounded-lg p-3">
                <div class="flex items-center gap-2 text-xs text-base-content/50 mb-2">
                    <span>Yesterday</span>
                </div>
                <p class="text-sm text-base-content">Profile photo updated! What do you all think? 📸</p>
            </div>
        </div>
    </div>
    
    <!-- Message -->
    <div class="px-4 py-4 border-t border-base-200 bg-base-200/50">
        <p class="text-sm font-medium text-base-content mb-2">Message from Emma:</p>
        <div id="message-content" data-interactive="true" class="bg-base-100 rounded-lg p-3 text-sm text-base-content/80 border border-base-300">
            <p>Hey! 👋 I think you know my cousin Tom? He mentioned you're into tech stuff.</p>
            <p class="mt-2">I've been getting into cryptocurrency investing and it's going really well! 📈 Made $5k last month.</p>
            <p class="mt-2">Would love to share some tips if you're interested! Do you have a Telegram?</p>
        </div>
    </div>
</div>
HTML;
    }

    private function whatsappScamMessageHtml(): string
    {
        return <<<'HTML'
<div class="bg-[#e5ddd5] dark:bg-[#0b141a] rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto">
    <!-- WhatsApp Header -->
    <div class="bg-[#075e54] dark:bg-[#1f2c34] text-white px-4 py-3">
        <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <div id="sender-number" data-interactive="true" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-base-content/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div>
                    <p class="font-medium">+1 (555) 123-4567</p>
                    <p class="text-xs opacity-70">Unknown number</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Chat Area -->
    <div class="p-4 min-h-[300px]">
        <!-- Date Badge -->
        <div class="text-center mb-4">
            <span class="bg-base-100/80 dark:bg-base-content/10 text-xs px-3 py-1 rounded-full text-base-content/60">Today</span>
        </div>
        
        <!-- Message Bubble -->
        <div class="flex justify-start mb-2">
            <div class="bg-white dark:bg-[#1f2c34] rounded-lg rounded-tl-none p-3 max-w-[85%] shadow">
                <p class="text-base-content text-sm">
                    ⚠️ <strong>ALERT from Chase Bank</strong>
                </p>
                <p id="urgency" data-interactive="true" class="text-base-content text-sm mt-2">
                    We detected unusual activity on your account. Your card ending in **4892 has been temporarily SUSPENDED.
                </p>
                <p class="text-base-content text-sm mt-2">
                    To restore access, verify your identity immediately:
                </p>
                <p id="link" data-interactive="true" class="text-[#53bdeb] text-sm mt-2 underline">
                    bit.ly/chase-verify-2026
                </p>
                <p class="text-base-content text-sm mt-2">
                    ❌ Failure to verify within 2 hours will result in permanent account closure.
                </p>
                <div class="flex justify-end mt-1">
                    <span class="text-[10px] text-base-content/50">10:34 AM</span>
                </div>
            </div>
        </div>
        
        <!-- Security Notice -->
        <div class="mt-4 bg-warning/20 border border-warning/40 rounded-lg p-3">
            <div class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-xs text-base-content/70">
                    <strong>Note:</strong> This number is not in your contacts. Be cautious with messages from unknown senders.
                </p>
            </div>
        </div>
    </div>
    
    <!-- Input Area (disabled) -->
    <div class="bg-[#f0f0f0] dark:bg-[#1f2c34] px-4 py-3 flex items-center gap-3">
        <div class="flex-1 bg-white dark:bg-[#2a3942] rounded-full px-4 py-2 text-sm text-base-content/50">
            Type a message
        </div>
        <div class="w-10 h-10 rounded-full bg-[#075e54] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        </div>
    </div>
</div>
HTML;
    }

    private function legitimateIMessageHtml(): string
    {
        return <<<'HTML'
<div class="bg-base-100 rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto">
    <!-- iMessage Header -->
    <div class="bg-base-200 px-4 py-3 border-b border-base-300">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span class="text-sm">Back</span>
            </div>
            <div id="sender-name" data-interactive="true" class="text-center">
                <p class="font-semibold text-base-content">Alex Chen</p>
                <p class="text-xs text-success">● iMessage</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                AC
            </div>
        </div>
    </div>
    
    <!-- Chat Area -->
    <div class="p-4 min-h-[300px] bg-base-100">
        <!-- Date Badge -->
        <div class="text-center mb-4">
            <span class="text-xs text-base-content/50">Today</span>
        </div>
        
        <!-- Previous messages (sent by you) -->
        <div id="conversation-history" data-interactive="true">
            <div class="flex justify-end mb-2">
                <div class="bg-primary text-primary-content rounded-2xl rounded-br-sm px-4 py-2 max-w-[75%]">
                    <p class="text-sm">Hey! Are we still on for Saturday?</p>
                </div>
            </div>
            <div class="flex justify-end mb-4">
                <span class="text-[10px] text-base-content/50 mr-2">Delivered</span>
            </div>
        </div>
        
        <!-- Received messages -->
        <div class="flex justify-start mb-2">
            <div class="bg-base-200 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[75%]">
                <p id="message-content" data-interactive="true" class="text-sm text-base-content">Yeah definitely! What time works for you?</p>
            </div>
        </div>
        
        <div class="flex justify-start mb-2">
            <div class="bg-base-200 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[75%]">
                <p class="text-sm text-base-content">I was thinking maybe brunch at that new place downtown</p>
            </div>
        </div>
        
        <div class="flex justify-start mb-2">
            <div class="bg-base-200 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[75%]">
                <p class="text-sm text-base-content">The one we talked about last week 🥞</p>
            </div>
        </div>
        
        <div class="flex justify-end mb-2">
            <div class="bg-primary text-primary-content rounded-2xl rounded-br-sm px-4 py-2 max-w-[75%]">
                <p class="text-sm">Perfect! Let's do 11am?</p>
            </div>
        </div>
        
        <div class="flex justify-start mb-2">
            <div class="bg-base-200 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[75%]">
                <p class="text-sm text-base-content">👍 Sounds good! See you then!</p>
            </div>
        </div>
    </div>
    
    <!-- Input Area -->
    <div class="bg-base-200 px-4 py-3 flex items-center gap-3 border-t border-base-300">
        <div class="flex-1 bg-base-100 rounded-full px-4 py-2 text-sm border border-base-300">
            <span class="text-base-content/50">iMessage</span>
        </div>
        <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </div>
    </div>
</div>
HTML;
    }

    private function smsVirusScamHtml(): string
    {
        return <<<'HTML'
<div class="bg-base-100 rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto">
    <!-- SMS Header -->
    <div class="bg-base-200 px-4 py-3 border-b border-base-300">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </div>
            <div id="sender-number" data-interactive="true" class="text-center">
                <p class="font-semibold text-base-content">5551234</p>
                <p class="text-xs text-base-content/50">Short Code</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
        </div>
    </div>
    
    <!-- Message Area -->
    <div class="p-4 min-h-[250px]">
        <!-- Date Badge -->
        <div class="text-center mb-4">
            <span class="text-xs text-base-content/50">Today, 2:45 PM</span>
        </div>
        
        <!-- SMS Bubble -->
        <div class="flex justify-start mb-2">
            <div class="bg-base-200 rounded-lg px-4 py-3 max-w-[90%] border border-base-300">
                <div id="virus-warning" data-interactive="true" class="flex items-center gap-2 mb-2">
                    <span class="text-error text-xl">⚠️🦠</span>
                    <span class="font-bold text-error">VIRUS DETECTED!</span>
                </div>
                <p class="text-sm text-base-content">
                    Your iPhone has been infected with (4) viruses. Your personal data and banking apps are at RISK!
                </p>
                <p class="text-sm text-base-content mt-2">
                    Download Apple Security Pro immediately to remove threats:
                </p>
                <p id="download-link" data-interactive="true" class="text-primary text-sm mt-2 underline">
                    apple-security-download.com/protect
                </p>
                <p class="text-sm text-error mt-2 font-semibold">
                    ⏰ Act within 5 minutes or data will be compromised!
                </p>
            </div>
        </div>
        
        <!-- Info Card -->
        <div class="mt-6 bg-info/10 border border-info/30 rounded-lg p-3">
            <div class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-xs text-base-content/70">
                    <p class="font-semibold mb-1">About this sender:</p>
                    <p>Short code 5551234 - Not recognized as Apple or your carrier. Messages from this number may be spam.</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Input Area -->
    <div class="bg-base-200 px-4 py-3 flex items-center gap-3 border-t border-base-300">
        <div class="flex-1 bg-base-100 rounded-full px-4 py-2 text-sm border border-base-300">
            <span class="text-base-content/50">Text Message</span>
        </div>
    </div>
</div>
HTML;
    }

    private function typosquattingLinkHtml(): string
    {
        return <<<'HTML'
<div class="bg-base-100 rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
    <!-- Context Header -->
    <div class="bg-base-200 px-6 py-4 border-b border-base-300">
        <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
                <p class="text-sm text-base-content/70">Received via email</p>
                <p class="font-medium text-base-content">Payment Link from Online Seller</p>
            </div>
        </div>
    </div>
    
    <!-- Link Preview -->
    <div class="p-6">
        <div class="bg-base-200/50 border border-base-300 rounded-xl p-5">
            <!-- PayPal-like branding -->
            <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-[#003087] rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold text-lg">PP</span>
                </div>
                <div>
                    <p class="font-semibold text-base-content">PayPal Payment</p>
                    <p class="text-sm text-base-content/60">Secure money transfer</p>
                </div>
            </div>
            
            <div class="divider my-2"></div>
            
            <div class="space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-base-content/70">Amount:</span>
                    <span class="font-semibold text-success">$350.00 USD</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-base-content/70">From:</span>
                    <span class="text-base-content">John B. (Marketplace Seller)</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-base-content/70">Note:</span>
                    <span class="text-base-content">Payment for camera equipment</span>
                </div>
            </div>
            
            <div class="divider my-2"></div>
            
            <!-- The suspicious link -->
            <div class="bg-base-100 rounded-lg p-4 border border-base-300">
                <p class="text-xs text-base-content/50 mb-1">Payment Link:</p>
                <div id="url-display" data-interactive="true" class="font-mono text-sm break-all text-primary">
                    https://www.paypa<span class="text-error font-bold">1</span>.com/receive/payment?id=8x7k2m
                </div>
            </div>
            
            <button id="accept-button" data-interactive="true" data-action="click_suspicious_link" class="btn btn-primary w-full mt-4 bg-[#0070ba] border-none hover:bg-[#005ea6]">
                Accept Payment
            </button>
        </div>
        
        <!-- URL Analysis -->
        <div class="mt-4 p-4 bg-warning/10 border border-warning/30 rounded-lg">
            <p class="text-sm font-semibold text-warning-content mb-2">🔍 Inspect the URL carefully:</p>
            <div class="font-mono text-sm bg-base-100 p-3 rounded border">
                paypa<span class="bg-error text-error-content px-1 rounded font-bold">1</span>.com
                <span class="text-xs text-base-content/50 ml-2">← This is the number ONE, not letter L</span>
            </div>
        </div>
    </div>
</div>
HTML;
    }

    private function legitimateShortenedLinkHtml(): string
    {
        return <<<'HTML'
<div class="bg-base-100 rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
    <!-- Slack-like context -->
    <div class="bg-[#4a154b] px-4 py-3">
        <div class="flex items-center gap-2 text-white">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
            </svg>
            <span class="font-semibold">Slack</span>
            <span class="text-white/60 text-sm ml-2">#team-engineering</span>
        </div>
    </div>
    
    <!-- Message -->
    <div class="p-4">
        <div id="sender-context" data-interactive="true" class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">
                SM
            </div>
            <div class="flex-1">
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-base-content">Sarah Martinez</span>
                    <span class="badge badge-sm badge-success">Your Manager</span>
                    <span class="text-xs text-base-content/50">10:32 AM</span>
                </div>
                <p class="text-base-content/80 text-sm mt-1">
                    Hey team! 👋 I've put together the Q1 planning doc we discussed in standup.
                </p>
            </div>
        </div>
        
        <!-- Link preview card -->
        <div class="ml-13 bg-base-200/50 border border-base-300 rounded-lg overflow-hidden">
            <div class="p-4">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <p class="font-medium text-base-content">Q1 Engineering Planning</p>
                        <p class="text-xs text-base-content/60">Google Docs</p>
                    </div>
                </div>
                
                <div id="url-display" data-interactive="true" class="bg-base-100 rounded p-3 border border-base-300">
                    <p class="text-xs text-base-content/50 mb-1">Shortened Link:</p>
                    <p class="font-mono text-sm text-primary">bit.ly/project-docs-q1</p>
                </div>
                
                <div id="preview-button" data-interactive="true" class="mt-3 p-3 bg-success/10 border border-success/30 rounded-lg">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="text-sm font-medium text-success">Preview verified</span>
                    </div>
                    <p class="text-xs text-base-content/70 mt-1">
                        Destination: <span class="font-mono">docs.google.com/document/d/1abc123/edit</span>
                    </p>
                </div>
            </div>
            
            <div class="bg-base-100 px-4 py-3 border-t border-base-300">
                <button class="btn btn-primary btn-sm gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Document
                </button>
            </div>
        </div>
        
        <!-- Thread replies -->
        <div class="ml-13 mt-3 text-sm text-base-content/60 flex items-center gap-2">
            <span>💬 3 replies</span>
            <span>•</span>
            <span>Last reply 2h ago</span>
        </div>
    </div>
</div>
HTML;
    }
}
