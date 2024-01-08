<?php
require_once('vendor/autoload.php'); // Include Stripe PHP library

\Stripe\Stripe::setApiKey('ca_FkyHCg7X8mlvCUdMDao4mMxagUfhIwXb'); // Set your secret key

header('Content-Type: application/json');

try {
  // Create a new Checkout Session
  $session = \Stripe\Checkout\Session::create([
    'payment_method_types' => ['card'],
    'line_items' => [
      [
        'price_data' => [
          'currency' => 'usd',
          'product_data' => [
            'name' => 'Your Product',
          ],
          'unit_amount' => 499, // Amount in cents
        ],
        'quantity' => 1,
      ],
    ],
    'mode' => 'payment',
    'success_url' => 'http://yourwebsite.com/payment_success.html',
    'cancel_url' => 'http://yourwebsite.com/payment_cancel.html',
  ]);

  echo json_encode(['id' => $session->id]);
} catch (Exception $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
?>
