<?php

namespace Database\Factories;

use App\Models\Scenario;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScenarioFactory extends Factory
{
    protected $model = Scenario::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['phishing_email', 'fake_profile', 'malicious_link']);

        return match ($type) {
            'phishing_email' => $this->phishingEmailDefinition(),
            'fake_profile' => $this->fakeProfileDefinition(),
            'malicious_link' => $this->maliciousLinkDefinition(),
        };
    }

    private function phishingEmailDefinition(): array
    {
        return [
            'title' => fake()->randomElement([
                'Suspicious Bank Alert',
                'Urgent Account Verification',
                'Prize Winner Notification',
                'IT Support Password Reset',
                'Shipping Delivery Notice',
            ]),
            'description' => 'Identify whether this email is a phishing attempt.',
            'type' => 'phishing_email',
            'difficulty' => fake()->randomElement(['easy', 'medium', 'hard']),
            'content' => [
                'from' => fake()->safeEmail(),
                'subject' => fake()->randomElement([
                    'URGENT: Your account has been compromised',
                    'Action Required: Verify your identity',
                    'You won a $1000 gift card!',
                    'Password expiring in 24 hours',
                ]),
                'body' => fake()->paragraph(4),
                'has_attachment' => fake()->boolean(30),
                'has_link' => true,
                'link_url' => 'http://' . fake()->domainWord() . '-secure.' . fake()->tld() . '/verify',
            ],
            'indicators' => [
                'Suspicious sender address',
                'Urgency in subject line',
                'Generic greeting',
                'Suspicious link URL',
            ],
            'explanation' => 'This email shows classic phishing indicators: urgency, suspicious sender, and a misleading link.',
            'is_active' => true,
            'media' => [],
        ];
    }

    private function fakeProfileDefinition(): array
    {
        return [
            'title' => fake()->randomElement([
                'Suspicious LinkedIn Request',
                'Unknown Facebook Friend',
                'Fake Instagram Influencer',
                'Suspicious Twitter DM',
            ]),
            'description' => 'Determine if this social media profile is fake.',
            'type' => 'fake_profile',
            'difficulty' => fake()->randomElement(['easy', 'medium', 'hard']),
            'content' => [
                'platform' => fake()->randomElement(['linkedin', 'facebook', 'instagram', 'twitter']),
                'display_name' => fake()->name(),
                'username' => fake()->userName(),
                'bio' => fake()->sentence(10),
                'followers' => fake()->numberBetween(5, 50),
                'following' => fake()->numberBetween(500, 5000),
                'posts_count' => fake()->numberBetween(0, 3),
                'account_age_days' => fake()->numberBetween(1, 14),
                'message' => 'Hey! I saw your profile and wanted to connect. Check out this amazing opportunity!',
            ],
            'indicators' => [
                'Very new account',
                'Low follower-to-following ratio',
                'Generic or stock profile photo',
                'Unsolicited message with link',
            ],
            'explanation' => 'This profile shows signs of being fake: new account, unusual follower ratio, and unsolicited messages.',
            'is_active' => true,
            'media' => [],
        ];
    }

    private function maliciousLinkDefinition(): array
    {
        return [
            'title' => fake()->randomElement([
                'Suspicious Download Link',
                'Shortened URL Analysis',
                'Look-alike Domain',
                'Redirect Chain Detection',
            ]),
            'description' => 'Analyze this link and determine if it is malicious.',
            'type' => 'malicious_link',
            'difficulty' => fake()->randomElement(['easy', 'medium', 'hard']),
            'content' => [
                'displayed_url' => 'https://www.' . fake()->domainName() . '/account',
                'actual_url' => 'http://' . fake()->domainWord() . '.' . fake()->tld() . '/steal-data',
                'context' => fake()->randomElement([
                    'Found in an email from an unknown sender.',
                    'Posted as a comment on a popular forum.',
                    'Sent via text message from an unknown number.',
                    'Found on a pop-up advertisement.',
                ]),
                'uses_https' => false,
                'is_shortened' => fake()->boolean(40),
            ],
            'indicators' => [
                'Mismatched displayed and actual URL',
                'No HTTPS',
                'Suspicious domain name',
                'Unknown sender context',
            ],
            'explanation' => 'The displayed URL differs from the actual destination, a classic sign of a malicious link.',
            'is_active' => true,
            'media' => [],
        ];
    }
}
