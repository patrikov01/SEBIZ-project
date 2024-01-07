<?php
// Set up PayPal API credentials
$client_id = 'YOUR_SANDBOX_CLIENT_ID';
$client_secret = 'YOUR_SANDBOX_CLIENT_SECRET';
$base_url = 'https://api.sandbox.paypal.com';

// Set up payment data
$data = [
    'intent' => 'sale',
    'payer' => [
        'payment_method' => 'paypal'
    ],
    'redirect_urls' => [
        'return_url' => 'http://yourwebsite.com/payment_success.php',
        'cancel_url' => 'http://yourwebsite.com/payment_cancel.php'
    ],
    'transactions' => [
        [
            'amount' => [
                'total' => '10.00', // Replace with your desired amount
                'currency' => 'USD' // Replace with your desired currency
            ],
            'description' => 'Payment for services'
        ]
    ]
];

// Prepare API request headers
$headers = [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode("$client_id:$client_secret")
];

// Initiate cURL to create payment
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $base_url . '/v1/payments/payment');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute cURL and get response
$response = curl_exec($ch);
curl_close($ch);

// Decode the response
$payment = json_decode($response);

// Redirect to PayPal for payment approval
header('Location: ' . $payment->links[1]->href);
exit;
?>
