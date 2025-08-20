<?php
/**
 * Plugin Name: Repair Admin Panel
 * Description: Admin panel to manage repairs via Supabase
 */

add_filter('woocommerce_account_menu_items', function($items) {
    $new_items = [];
    foreach ($items as $key => $value) {
        $new_items[$key] = $value;
        if ($key === 'downloads') {
            $new_items['repairs'] = 'Repairs';
        }
    }
    return $new_items;
}, 999);

add_action('init', function() {
    add_rewrite_endpoint('repairs', EP_ROOT | EP_PAGES);
});

add_action('woocommerce_account_repairs_endpoint', function() {
    ?>
    <div class="wrap">
        <h2 style="color: #1e40af; font-size: 28px; margin-bottom: 20px;">📦 Your Repair Requests</h2>
        <?php wp_nonce_field('payu_payment_nonce', 'payu_nonce_field'); ?>
        <style>
            :root {
                --primary-blue: #1e40af;
                --accent-blue: #4f46e5;
                --green-approve: #16a34a;
                --red-decline: #dc2626;
                --green-pay: #39e75f;
                --border-color: #e0e0e0;
                --background-light: #ffffff;
                --text-color: #444;
            }

            .repair-card-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 24px;
                padding: 20px 0;
            }

            .repair-card {
                padding: 20px;
                border: 1px solid var(--border-color);
                border-radius: 12px;
                background: var(--background-light);
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                transition: transform 0.2s ease;
            }

            .repair-card:hover {
                transform: translateY(-5px);
            }

            .repair-card h3 {
                margin: 0 0 15px;
                font-size: 22px;
                color: var(--primary-blue);
                font-weight: 600;
            }

            .repair-card p {
                margin: 0 0 10px;
                color: var(--text-color);
                font-size: 15px;
            }

            .repair-card p:last-of-type {
                margin-bottom: 0;
            }

            .repair-card strong {
                color: #666;
                font-weight: 500;
            }

            .repair-status {
                font-weight: 600;
                color: var(--accent-blue);
                padding: 2px 8px;
                background: #eef2ff;
                border-radius: 4px;
            }

            .action-buttons-group {
                margin-top: 20px;
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }

            .action-button {
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .action-button:hover {
                filter: brightness(1.1);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }

            .approve-button {
                background: var(--green-approve);
            }

            .decline-button {
                background: var(--red-decline);
            }

            .pay-now-button {
                background: var(--green-pay);
                font-size: 16px;
                padding: 12px 24px;
            }

            .view-report-button {
                background: var(--accent-blue);
                font-size: 14px;
                padding: 10px 18px;
    			color: white !important;;
            }

            .loader-wrapper {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100px;
                background: #f9f9f9;
                border-radius: 8px;
            }

            .dot-loader {
                display: flex;
                gap: 10px;
            }

            .dot-loader span {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: var(--accent-blue);
                animation: bounce 0.6s infinite alternate;
            }

            .dot-loader span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .dot-loader span:nth-child(3) {
                animation-delay: 0.4s;
            }
			
			.tracking-id {
				margin-left: 2em; /* Creates the gap */
				font-weight: normal; /* Makes it regular weight, not bold like the h3 */
				font-size: 0.8em;  /* Makes it slightly smaller */
				color: #111;      /* A slightly lighter color */
			}

            @keyframes bounce {
                to {
                    transform: translateY(-10px);
                    opacity: 0.7;
                }
            }
        </style>

        <div id="repairs-app">
            <div class="loader-wrapper">
                <div class="dot-loader">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.42.3/dist/umd/supabase.min.js"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function () {
                const repairsApp = document.getElementById("repairs-app");
                if (!repairsApp) return;

                const waitForSupabase = setInterval(() => {
                    if (!window.supabase) return;
                    clearInterval(waitForSupabase);

                    const supabase = window.supabase.createClient(
                        "https://woytkkdndxpspbdrpbbt.supabase.co",
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveXRra2RuZHhwc3BiZHJwYmJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE3MTYwNiwiZXhwIjoyMDY1NzQ3NjA2fQ.iJ1pDCZE0V1_9jLg0e_vHVZr-Fddi1fG8gZhrCrtAw0"
                    );

                    fetch("https://rigmentor.in/wp-json/wp/v2/users/me", { credentials: "include" })
                        .then(res => {
                            if (!res.ok) throw new Error("Not logged in");
                            return res.json();
                        })
                        .then(user => {
                            const email = user.email;
                            return supabase
                                .from("repairs")
                                .select("*, repair_reports(report_url), payment_status") // Explicitly select payment_status
                                .eq("user_id", email);
                        })
                        .then(({ data, error }) => {
                            if (error || !data) {
                                repairsApp.innerHTML = "<p style='color: var(--red-decline);'>❌ Failed to fetch repair data.</p>";
                                return;
                            }

                            if (data.length === 0) {
                                repairsApp.innerHTML = "<p style='color: var(--text-color);'>🕵️ No repairs found.</p>";
                                return;
                            }
                            repairsApp.innerHTML = `<div class="repair-card-container">` + data.map(r => {
                                const isAwaiting = r.status === "Awaiting Approval";
                                const hasCost = r.estimated_cost !== null && r.estimated_cost !== undefined;
                                const report = r.repair_reports && r.repair_reports.length > 0 ? r.repair_reports[0] : null;
                                const hasReportUrl = report && typeof report.report_url === 'string' && report.report_url.trim().length > 0;
                                const isPaid = r.payment_status === 'paid'; // Check payment status

                                return `
                                    <div class="repair-card">
                                        <h3>🛠 ${r.product_model} <span class="tracking-id"> <strong>Tracking ID : </strong> ${r.tracking_id}</span> </h3>
                                        <p><strong>Type:</strong> ${r.product_type}</p>
                                        <p><strong>Serial:</strong> ${r.serial_number}</p>
                                        <p><strong>Status:</strong> <span class="repair-status">${r.status}</span></p>

                                        ${hasCost ? `
                                            <p><strong>Estimated Cost:</strong> ₹${r.estimated_cost}</p>
                                        ` : ''}
                                        
                                        <p><strong>Payment Status:</strong> <span class="payment-status ${r.payment_status || 'pending'}">${r.payment_status ? r.payment_status.charAt(0).toUpperCase() + r.payment_status.slice(1) : 'Pending'}</span></p>

                                        ${r.status === 'Repaired' && hasCost && !isPaid ? `
                                            <div class="action-buttons-group">
                                                <button onclick="handlePayNow('${r.id}', ${r.estimated_cost})" 
                                                        class="action-button pay-now-button">
                                                    💰 Pay Now ₹${r.estimated_cost}
                                                </button>
                                            </div>
                                        ` : ''}

                                        ${hasReportUrl ? `
                                            <div class="action-buttons-group">
                                                <a href="${report.report_url}" target="_blank" 
                                                   class="action-button view-report-button">
                                                    📄 View Diagnostic Report
                                                </a>
                                            </div>
                                        ` : ''}

                                        ${isAwaiting ? `
                                            <div class="action-buttons-group">
                                                <button onclick="handleRepairAction('${r.id}', 'Repair In Progress')" 
                                                        class="action-button approve-button">
                                                     Approve
                                                </button>
                                                <button onclick="handleRepairAction('${r.id}', 'Cancelled')" 
                                                        class="action-button decline-button">
                                                     Decline
                                                </button>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join("") + `</div>`;
                            window.handleRepairAction = function (repairId, newStatus) {
                                if (!confirm(`Are you sure you want to mark this as '${newStatus}'?`)) return;
                                supabase
                                    .from("repairs")
                                    .update({ status: newStatus })
                                    .eq("id", repairId)
                                    .then(({ error }) => {
                                        if (error) {
                                            alert("❌ Failed to update status.");
                                            console.error(error);
                                        } else {
                                            alert("✅ Status updated!");
                                            location.reload();
                                        }
                                    });
                            };
        
window.handlePayNow = function (repairId, amount) {
	console.log('Starting fetch');
    const payButton = event.target;
    const originalButtonText = payButton.textContent;
    payButton.disabled = true;
    payButton.textContent = 'Processing...';
    const userId = "<?php echo get_current_user_id(); ?>";
    const nonce = document.querySelector('#payu_nonce_field').value; // Get the nonce value
    const data = {
        action: 'initiate_payu_payment',
        repair_id: repairId,
        user_id: userId,
        nonce: nonce, // Add the nonce to the data
    };
    fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams(data).toString(),
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(result => {
        console.log('Fetch result:', result); // Debug log
        if (result.success && result.data && result.data.payu_form_data) {
            const form = document.createElement('form');
            form.method = 'post';
            form.action = result.data.payu_url; // Should be https://test.payu.in/_payment
            form.name = 'payu_form';
            for (const key in result.data.payu_form_data) {
                if (result.data.payu_form_data.hasOwnProperty(key)) {
                    const hiddenField = document.createElement('input');
                    hiddenField.type = 'hidden';
                    hiddenField.name = key;
                    hiddenField.value = result.data.payu_form_data[key];
                    form.appendChild(hiddenField);
                }
            }
            document.body.appendChild(form);
            form.submit(); // Submit the form to PayU
        } else {
            alert('Payment initiation failed: ' + (result.data || 'Unknown error'));
            payButton.disabled = false;
            payButton.textContent = originalButtonText;
        }
    })
    .catch(error => {
        console.error('Error initiating PayU payment:', error);
        alert('An error occurred: ' + error.message);
        payButton.disabled = false;
        payButton.textContent = originalButtonText;
    });
};				
						
	
							
												
                        })
                        .catch(err => {
                            repairsApp.innerHTML = `<p style='color: var(--red-decline);'>❌ Error: ${err.message}</p>`;
                            console.error(err);
                        });
                }, 300);
            });
        </script>
    </div>
    <?php
});
