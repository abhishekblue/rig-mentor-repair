<?php
// Prevent direct access to the file
if (!defined('ABSPATH')) {
    exit;
}

define('PAYU_MERCHANT_KEY', 'gieYzY');
define('PAYU_SALT', 'Qnpj6gWl3Q0Oo5GElt8QX0KZl20SAZOj');
define('PAYU_BASE_URL', 'https://secure.payu.in/_payment');
define('SUPABASE_URL', 'https://woytkkdndxpspbdrpbbt.supabase.co');
define('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveXRra2RuZHhwc3BiZHJwYmJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE3MTYwNiwiZXhwIjoyMDY1NzQ3NjA2fQ.iJ1pDCZE0V1_9jLg0e_vHVZr-Fddi1fG8gZhrCrtAw0');

// Fetch repair data from Supabase
function get_repair_from_supabase($repair_id) {
    $url = SUPABASE_URL . '/rest/v1/repairs';
    $args = array(
        'headers' => array(
            'apikey' => SUPABASE_SERVICE_ROLE_KEY,
            'Authorization' => 'Bearer ' . SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Range' => '0-0',
        ),
        'method' => 'GET',
        'timeout' => 15,
        'httpversion' => '1.1',
        'sslverify' => true, // IMPORTANT: Enable SSL verification for production
    );
    $query_params = array('id' => 'eq.' . $repair_id, 'select' => 'estimated_cost,status,payment_status');
    $url = add_query_arg($query_params, $url);
    $response = wp_remote_get($url, $args);
    if (is_wp_error($response)) {
        error_log('Supabase GET Error: ' . $response->get_error_message());
        return $response;
    }
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body);
    return (empty($data) || !is_array($data) || !isset($data[0])) ? new WP_Error('supabase_no_data', 'No repair data found.') : $data[0];
}

// Update repair payment status in Supabase
function update_repair_payment_status($repair_id, $payment_status) {
    $url = SUPABASE_URL . '/rest/v1/repairs';
    $args = array(
        'headers' => array(
            'apikey' => SUPABASE_SERVICE_ROLE_KEY,
            'Authorization' => 'Bearer ' . SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type' => 'application/json',
        ),
        'method' => 'PATCH',
        'timeout' => 15,
        'httpversion' => '1.1',
        'body' => json_encode(['payment_status' => $payment_status]),
        'sslverify' => true, // IMPORTANT: Enable SSL verification for production
    );
    $query_params = array('id' => 'eq.' . $repair_id);
    $url = add_query_arg($query_params, $url);
    $response = wp_remote_request($url, $args);
    if (is_wp_error($response)) {
        error_log('Supabase PATCH Error: ' . $response->get_error_message());
        return false;
    }
    $response_code = wp_remote_retrieve_response_code($response);
    return ($response_code >= 200 && $response_code < 300);
}

// Verify PayU response hash
function verify_payu_response_hash($posted) {
    if (!isset($posted['hash']) || !isset($posted['status'])) {
        error_log('PayU Response: Missing hash or status in POST data.');
        return false;
    }
    $key = PAYU_MERCHANT_KEY;
    $salt = PAYU_SALT;
    $status = $posted['status'];
    $txnid = $posted['txnid'];
    $amount = $posted['amount'];
    $productinfo = $posted['productinfo'];
    $firstname = $posted['firstname'];
    $email = $posted['email'];
    $udf1 = $posted['udf1'] ?? '';
    $udf2 = $posted['udf2'] ?? '';
    $udf3 = $posted['udf3'] ?? '';
    $udf4 = $posted['udf4'] ?? '';
    $udf5 = $posted['udf5'] ?? '';
    $udf6 = $posted['udf6'] ?? '';
    $udf7 = $posted['udf7'] ?? '';
    $udf8 = $posted['udf8'] ?? '';
    $udf9 = $posted['udf9'] ?? '';
    $udf10 = $posted['udf10'] ?? '';
    $hash_sequence = 'key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10';
    // The hash sequence for success and failure is the same, so no conditional logic is needed here.
    $hash_string = $salt . '|' . $status . '|' . $hash_sequence;
    $hash_string = str_replace(array('key', 'txnid', 'amount', 'productinfo', 'firstname', 'email', 'udf1', 'udf2', 'udf3', 'udf4', 'udf5', 'udf6', 'udf7', 'udf8', 'udf9', 'udf10'), array($key, $txnid, $amount, $productinfo, $firstname, $email, $udf1, $udf2, $udf3, $udf4, $udf5, $udf6, $udf7, $udf8, $udf9, $udf10), $hash_string);
    $calculated_hash = strtolower(hash('sha512', $hash_string));
    if ($calculated_hash === $posted['hash']) return true;
    error_log('PayU Hash Mismatch! Calculated: ' . $calculated_hash . ' | Received: ' . $posted['hash'] . ' | TxnID: ' . $txnid);
    return false;
}

// Initiate PayU payment

// [Previous code remains unchanged until handle_payu_payment_initiation]

// Initiate PayU payment
add_action('wp_ajax_initiate_payu_payment', 'handle_payu_payment_initiation');
add_action('wp_ajax_nopriv_initiate_payu_payment', 'handle_payu_payment_initiation');
function handle_payu_payment_initiation() {
    // Verify nonce for security
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'payu_payment_nonce')) {
        wp_send_json_error('Security check failed. Invalid nonce.');
    }

    if (!isset($_POST['repair_id'], $_POST['user_id'])) {
        wp_send_json_error('Missing essential payment data.');
    }
    $repair_id = sanitize_text_field($_POST['repair_id']);
    $user_id = intval($_POST['user_id']);
    if (!is_user_logged_in() || get_current_user_id() !== $user_id) {
        wp_send_json_error('Unauthorized access or invalid user.');
    }
    $current_user = wp_get_current_user();
    $user_email = $current_user->user_email;
    $user_name = $current_user->display_name;
    $user_phone = get_user_meta($user_id, 'billing_phone', true) ?: '9999999999';
    $repair_data = get_repair_from_supabase($repair_id);
    if (is_wp_error($repair_data) || !isset($repair_data->estimated_cost) || $repair_data->status !== 'Repaired') {
        wp_send_json_error('Invalid repair details or status.');
    }
    $amount = floatval($repair_data->estimated_cost);
    $product_info = sprintf('Repair for Product ID: %s', $repair_id);
    $txnid = substr(hash('sha256', mt_rand() . microtime()), 0, 20);
    $surl = add_query_arg('nocache', time(), home_url('/my-account/repairs/payu-success/'));
    $furl = add_query_arg('nocache', time(), home_url('/my-account/repairs/payu-failure/'));
    $curl = add_query_arg('nocache', time(), home_url('/my-account/repairs/payu-cancel/'));
    $payu_params = array(
        'key' => PAYU_MERCHANT_KEY,
        'txnid' => $txnid,
        'amount' => $amount,
        'productinfo' => $product_info,
        'firstname' => $user_name,
        'email' => $user_email,
        'phone' => $user_phone,
        'surl' => $surl,
        'furl' => $furl,
        'curl' => $curl,
        'service_provider' => 'payu_paisa',
        'udf1' => $repair_id,
        'udf2' => $user_id,
        'udf3' => '',
        'udf4' => '',
        'udf5' => '',
    );
    $hash_string = '';
    $hash_vars_seq = array('key', 'txnid', 'amount', 'productinfo', 'firstname', 'email', 'udf1', 'udf2', 'udf3', 'udf4', 'udf5', 'udf6', 'udf7', 'udf8', 'udf9', 'udf10');
    foreach ($hash_vars_seq as $hash_var) {
        $hash_string .= isset($payu_params[$hash_var]) ? $payu_params[$hash_var] : '';
        $hash_string .= '|';
    }
    $hash_string .= PAYU_SALT;
    $payu_params['hash'] = strtolower(hash('sha512', $hash_string));
    // Ensure all mandatory parameters are explicitly set
    if (!isset($payu_params['key']) || !isset($payu_params['txnid']) || !isset($payu_params['amount']) || 
        !isset($payu_params['productinfo']) || !isset($payu_params['surl']) || !isset($payu_params['hash']) || 
        !isset($payu_params['firstname']) || !isset($payu_params['email']) || !isset($payu_params['phone'])) {
        wp_send_json_error('Missing mandatory PayU parameters.');
    }
    wp_send_json_success(array('payu_url' => PAYU_BASE_URL, 'payu_form_data' => $payu_params));
}


// Handle PayU webhook callback
add_action('wp_ajax_payu_callback', 'handle_payu_callback');
add_action('wp_ajax_nopriv_payu_callback', 'handle_payu_callback');
function handle_payu_callback() {
    $posted_data = $_POST;
    if (empty($posted_data) || !verify_payu_response_hash($posted_data)) {
        wp_send_json_error('Invalid PayU callback.');
        return;
    }
    $repair_id = sanitize_text_field($posted_data['udf1']);
    $status = $posted_data['status'];
    $payment_status = ($status === 'success') ? 'paid' : 'pending';
    if (!empty($repair_id)) {
        if (!update_repair_payment_status($repair_id, $payment_status)) {
            error_log('Failed to update payment status for repair_id: ' . $repair_id);
        }
    } else {
        error_log('PayU Callback: Missing repair_id in UDF1.');
    }
    // Always respond with 200 OK to acknowledge webhook, regardless of internal processing success
    status_header(200);
    echo 'OK';
    wp_die(); // Terminate to prevent further output
}

// Comment out or remove separate endpoints since webhook handles all
/*
add_action('init', function() {
    add_rewrite_endpoint('payu-success', EP_ROOT | EP_PAGES);
    add_rewrite_endpoint('payu-failure', EP_ROOT | EP_PAGES);
    add_rewrite_endpoint('payu-cancel', EP_ROOT | EP_PAGES);
});

add_action('woocommerce_account_payu-success_endpoint', function() {
    // Removed - handled by webhook
});
add_action('woocommerce_account_payu-failure_endpoint', function() {
    // Removed - handled by webhook
});
add_action('woocommerce_account_payu-cancel_endpoint', function() {
    // Removed - handled by webhook
});
*/
