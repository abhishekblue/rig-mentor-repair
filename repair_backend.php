<?php
add_action('admin_menu', function () {
    add_menu_page(
        'Repair Dashboard',
        'Repair Dashboard',
        'manage_options',
        'repair-dashboard',
        function () {
            ?>
            <div class="wrap">
                <h1>Repair Dashboard (Supabase)</h1>
                <input type="text" id="search-input" placeholder="Search repairs..." style="margin-bottom: 20px; padding: 10px; width: 300px; border: 1px solid #ccc; border-radius: 4px;">
                <div id="repair-root">Loading repair data...</div>
                <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/dist/umd/supabase.min.js"></script>
                <script>
                const supabaseClient = window.supabase.createClient(
                    'https://woytkkdndxpspbdrpbbt.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveXRra2RuZHhwc3BiZHJwYmJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE3MTYwNiwiZXhwIjoyMDY1NzQ3NjA2fQ.iJ1pDCZE0V1_9jLg0e_vHVZr-Fddi1fG8gZhrCrtAw0'
                );
                window.submitReport = async function (repairId) {
                    console.log("Submit clicked for", repairId);
                    const costInput = document.getElementById(`cost-${repairId}`);
                    const fileInput = document.getElementById(`file-${repairId}`);
                    const statusDropdown = document.getElementById(`status-${repairId}`);
                    const msgBox = document.getElementById(`msg-${repairId}`);
                    const reportLinkContainer = document.getElementById(`report-link-${repairId}`);
                    const cost = costInput.value;
                    const file = fileInput.files[0];
                    const currentStatus = statusDropdown.value;
                    let existingReportUrl = null;
                    if (reportLinkContainer) {
                        const existingReportLink = reportLinkContainer.querySelector('a.report-link');
                        if (existingReportLink) {
                            existingReportUrl = existingReportLink.getAttribute('href');
                        }
                    }



                    const isStatusAwaitingApproval = currentStatus === "Awaiting Approval";
                    const hasCostEntered = cost.trim() !== '' && !isNaN(parseFloat(cost)) && parseFloat(cost) > 0;
                    const hasNewFileSelected = file !== undefined && file !== null;
                    const hasAnyReport = existingReportUrl !== null || hasNewFileSelected;
                    let validationMessages = [];

                    // Enforce cost and report checks only when setting to "Awaiting Approval" or uploading a new file
                    if (isStatusAwaitingApproval) {
                        if (!hasCostEntered) {
                            validationMessages.push("Price must be entered when setting status to 'Awaiting Approval'.");
                        }
                        if (!hasAnyReport) {
                            validationMessages.push("Diagnostic Report must be added when setting status to 'Awaiting Approval'.");
                        }
                    }
                    if (hasNewFileSelected) {
                        if (!isStatusAwaitingApproval) {
                            validationMessages.push("Status must be 'Awaiting Approval' when a NEW Diagnostic Report is uploaded.");
                        }
                        if (!hasCostEntered) {
                            validationMessages.push("Price must be entered when a NEW Diagnostic Report file is uploaded.");
                        }
                    }
                    if (validationMessages.length > 0) {
                        msgBox.innerHTML = "❌ " + validationMessages.join("<br>❌ ");
                        return;
                    }


                    const currentCostValueAttr = costInput.getAttribute('value');
                    const isCostModified = (currentCostValueAttr === null || currentCostValueAttr === '') && hasCostEntered ||
                        (currentCostValueAttr !== null && currentCostValueAttr !== '' && parseFloat(currentCostValueAttr) !== parseFloat(cost));
                    if (isCostModified) {
                        if (!confirm(`Are you sure you want to update the Estimated Cost to ₹${cost}?`)) {
                            msgBox.innerText = "Cost update cancelled.";
                            return;
                        }
                    }
                    msgBox.innerText = "Processing...";
                    let reportUrl = existingReportUrl;
                    if (hasNewFileSelected) {
                        msgBox.innerText = "Uploading file...";
                        const { data, error } = await supabaseClient.storage
                            .from('repair-reports')
                            .upload(`${repairId}/${file.name}`, file, {
                                cacheControl: '3600',
                                upsert: true
                            });
                        if (error) {
                            msgBox.innerText = "❌ Upload failed: " + error.message;
                            return;
                        }
                        const { data: urlData } = supabaseClient.storage
                            .from('repair-reports')
                            .getPublicUrl(`${repairId}/${file.name}`);
                        reportUrl = urlData.publicUrl;
                        await supabaseClient.from("repair_reports").insert([{
                            repair_id: repairId,
                            report_url: reportUrl,
                            report_text: null
                        }]);
                    }

                const { error: updateError } = await supabaseClient
                    .from("repairs")
                    .update({
                        estimated_cost: hasCostEntered ? Number(cost) : null,
                        status: currentStatus
                    })
                    .eq("id", repairId);
                if (updateError) {
                    msgBox.innerText = "❌ Failed to update repair: " + updateError.message;
                    console.error(updateError);
                    return;
                } else {
                    const statusDropdown = document.getElementById(`status-${repairId}`);
                    if (statusDropdown) {
                        const customerViewSpan = statusDropdown.previousElementSibling.querySelector('strong');
                        if (customerViewSpan) {
                            customerViewSpan.innerText = currentStatus;
                        }
                        const repairItem = allRepairData.find(item => item.id === repairId);
                        if (repairItem) {
                            repairItem.status = currentStatus;
                            const statusTd = statusDropdown.closest('td');
                            if (statusTd) {
                                let payButtonContainer = statusTd.querySelector('.pay-button-container');
                                if (!payButtonContainer) {
                                    payButtonContainer = document.createElement('div');
                                    payButtonContainer.className = 'pay-button-container';
                                    statusTd.appendChild(payButtonContainer);
                                }
                                payButtonContainer.innerHTML = `${repairItem.status === 'Repaired' && repairItem.estimated_cost && repairItem.estimated_cost > 0 ?
                                    `<div style="margin-top: 10px;">
                                        <button class="pay-now-btn" data-id="${repairItem.id}" data-amount="${repairItem.estimated_cost}">
                                            Pay Now ₹${repairItem.estimated_cost}
                                        </button>
                                    </div>` : ''}`;
                            }
                        }
                    }
                }


                    if (reportLinkContainer && reportUrl) {
                        const safeUrl = encodeURIComponent(reportUrl);
                        reportLinkContainer.innerHTML = `<div style="display: flex; align-items: center; gap: 10px;">
                            <a href="${reportUrl}" target="_blank" class="report-link">📄 View Report</a>
                            <button onclick="removeReport('${repairId}', decodeURIComponent('${safeUrl}'))"
                                title="Remove Report" style="background:none;border:none;color:#dc2626;font-size:18px;cursor:pointer;">×</button>
                        </div>`;
                        fileInput.value = '';
                    }
                    msgBox.innerText = "✅ Repair details updated successfully!";
                    const currentRepairData = allRepairData.find(item => item.id === repairId);
                    if (currentRepairData) {
                        currentRepairData.status = currentStatus;
                        currentRepairData.estimated_cost = hasCostEntered ? Number(cost) : null;
                        const statusTd = document.querySelector(`#status-${repairId}`).closest('td');
                        if (statusTd) {
                            const payButtonHtml = `${currentRepairData.status === 'Repaired' && currentRepairData.estimated_cost && currentRepairData.estimated_cost > 0 ?
                                `<div style="margin-top: 10px;">
                                    <button class="pay-now-btn" data-id="${currentRepairData.id}" data-amount="${currentRepairData.estimated_cost}">
                                        Pay Now ₹${currentRepairData.estimated_cost}
                                    </button>
                                </div>` : ''}`;
                            let existingPayDiv = statusTd.querySelector('.pay-button-container');
                            if (!existingPayDiv) {
                                existingPayDiv = document.createElement('div');
                                existingPayDiv.className = 'pay-button-container';
                                statusTd.appendChild(existingPayDiv);
                            }
                            existingPayDiv.innerHTML = payButtonHtml.trim();
                        }
                    }
                };
                const styleTag = document.createElement("style");
                styleTag.innerHTML = `.repair-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #fff;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    font-family: Arial, sans-serif;
                }
                .repair-table th, .repair-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                }
                .repair-table th {
                    background: #0073aa;
                    color: white;
                    font-weight: 600;
                }
                .repair-table tr:nth-child(even) {
                    background: #f9f9f9;
                }
                .repair-table tr:hover {
                    background: #f1f1f1;
                }
                .status-dropdown {
                    padding: 6px;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                    background: #f9f9f9;
                    font-size: 14px;
                }
                .submit-btn {
                    padding: 8px 16px;
                    background: #0073aa;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.3s ease, transform 0.2s ease;
                }
                .submit-btn:hover {
                    background: #006599;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                }
                .trash-btn {
                    background: none;
                    border: none;
                    color: #dc2626; /* Red color for trash icon */
                    font-size: 18px;
                    cursor: pointer;
                    padding-top: 10px; /* Add padding on top */
                }
                .trash-btn:hover {
                    color: #b91c1c; /* Darker red on hover */
                }
                .report-link {
                    display: inline-block;
                    padding: 6px 12px;
                    background: #46b450;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                }
                .report-link:hover {
                    background: #3a9b42;
                }
                .input-field {
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    width: 100px;
                }
                .file-input {
                    margin: 10px 0;
                }
                .msg-box {
                    margin-top: 10px;
                    font-size: 14px;
                    color: #333;
                }
                .pay-now-btn {
                    padding: 8px 16px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s ease, transform 0.2s ease;
                }
                .pay-now-btn:hover {
                    background: #218838;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                }
				tr {
					text-transform: capitalize;
					}
                .payment-status {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: 750;
                }    
                .payment-status.none { color: #fffff }
                .payment-status.pending { color: #ff0000 }
                .payment-status.paid { color: #00ff00 }
                .repair-table th[data-sort] {
                    cursor: pointer;
                    position: relative;
                }
                .repair-table th[data-sort]::after {
                    content: '';
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    border: 4px solid transparent;
                }
                .repair-table th[data-sort][data-order="asc"]::after {
                    border-bottom-color: white;
                    margin-top: -4px;
                }
                .repair-table th[data-sort][data-order="desc"]::after {
                    border-top-color: white;
                    margin-top: 4px;
                }
                `;
                document.head.appendChild(styleTag);
                let allRepairData = [];
                supabaseClient
                    .from('repairs')
                    .select('*, repair_reports(report_url), payment_status') // Explicitly select payment_status
                    .eq('is_trashed', false) // Filter out trashed items
                    .then(({ data, error }) => {
                        if (error) {
                            document.getElementById("repair-root").innerText = "❌ Error: " + error.message;
                            return;
                        }
                        allRepairData = data;

                       
                        const html = `<table class="repair-table">
                        <thead>
                            <tr>
                                <th data-sort="product_type">Product</th>
                                <th data-sort="user_id">User ID</th>
                                <th data-sort="product_model">Model</th>
                                <th data-sort="issue_description">Issue</th>
                                <th data-sort="pickup_date">Pickup Date</th>
                                <th data-sort="status">Status</th>
                                <th data-sort="estimated_cost">Cost (₹)</th>
                                <th data-sort="payment_status">Payment Status</th>
                                <th>Report</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        
						<tbody>
    ${allRepairData.map(r => {
        const report = r.repair_reports && r.repair_reports.length > 0 ? r.repair_reports[0] : null;
        const hasReportUrl = report && report.report_url && report.report_url.length > 5;
        const safeUrl = hasReportUrl ? encodeURIComponent(report.report_url) : '';
        const paymentStatus = r.status === 'Repaired' || r.status === 'Ready for Delivery' || r.status === 'Delivered' ? (r.payment_status || 'Pending') : 'None';
        console.log('Repair data:', r); // Debug each row
        return `
            <tr>
                <td>
					<div style="margin: 2px 0; color: #333; text-transform: uppercase;">${r.product_type || '—'}</div>
					<div style="margin: 2px 0; color: #444; font-weight: bold;">Tracking ID: ${r.tracking_id || '—'}</div>
				</td>
                <td>${r.user_id || '—'}</td>
                <td>${r.product_model || '—'}</td>
                <td>${r.issue_description || '—'}</td>
                <td>${r.pickup_date ? new Date(r.pickup_date).toLocaleDateString() : '—'}</td>
                <td>
                    <div style="color: #555; margin-bottom: 5px;">
                        <span style="display:inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #28a745; margin-right: 5px;"></span>
                        Customer View: <strong>${r.status || '—'}</strong>
                    </div>
                    <select id="status-${r.id}" class="status-dropdown">
                        ${['Submitted', 'Picked Up', 'Under Diagnosis', 'Awaiting Approval', 'Repair In Progress', 'Repaired', 'Ready for Delivery', 'Delivered', 'Cancelled']
                            .map(statusOption => `<option value="${statusOption}" ${statusOption === r.status ? "selected" : ""}>${statusOption}</option>`).join("")}
                    </select>
                </td>
                <td>
                    <input type="number" id="cost-${r.id}" class="input-field" value="${r.estimated_cost ? r.estimated_cost : ''}" />
                </td>
                <td>
                    <span class="payment-status ${paymentStatus.toLowerCase()}">${paymentStatus}</span>
                </td>
							<td>
								<input type="file" id="file-${r.id}" accept="application/pdf" class="file-input" ${hasReportUrl ? 'style="display:none;"' : ''} />
								<div id="report-link-${r.id}">
									${hasReportUrl ? `<div style="display: flex; align-items: center; gap: 10px;">
										<a href="${report.report_url}" target="_blank" class="report-link">📄 View Report</a>
										<button onclick="removeReport('${r.id}', decodeURIComponent('${safeUrl}'))"
											title="Remove Report" style="background:none;border:none;color:#dc2626;font-size:18px;cursor:pointer;">×</button>
									</div>` : ''}
								</div>
								<div class="actions">
									${r.uploaded_file_url && r.uploaded_file_url.length > 0 
									  ? `<button
 											style="background:#2563eb; color:white; padding:6px 18px; border-radius:8px; border:none; font-weight:500; cursor:pointer;"
										 	onclick="${r.uploaded_file_url
										  .split(',')
										  .map(url => `window.open('${url.trim()}', '_blank');`)
										  .join(' ')}" title="View All Uploaded Files">View Uploaded Files</button>`
									  : '<span>No file</span>'
									}
								</div>
							</td>
                			<td>
								<button class="submit-btn" data-id="${r.id}">Update</button>
								<button class="trash-btn" data-id="${r.id}" title="Move to Trash">🗑️</button>
								<div id="msg-${r.id}" class="msg-box"></div>
							</td>
						</tr>`;
				}).join("")}
			</tbody>
	</table>`;



                        document.getElementById("repair-root").innerHTML = html;
                        document.querySelectorAll('.submit-btn').forEach(btn => {
                            btn.addEventListener('click', () => {
                                const repairId = btn.dataset.id;
                                window.submitReport(repairId);
                            });
                        });

                        // Search functionality
                        const searchInput = document.getElementById('search-input');
                        searchInput.addEventListener('input', (e) => {
                            const searchTerm = e.target.value.toLowerCase();
                            const rows = document.querySelectorAll('.repair-table tbody tr');
                            rows.forEach(row => {
                                const rowText = row.innerText.toLowerCase();
                                if (rowText.includes(searchTerm)) {
                                    row.style.display = '';
                                } else {
                                    row.style.display = 'none';
                                }
                            });
                        });

                        // Sorting functionality
                        document.querySelectorAll('.repair-table th[data-sort]').forEach(header => {
                            header.addEventListener('click', () => {
                                const sortBy = header.dataset.sort;
                                const currentOrder = header.dataset.order || 'asc';
                                const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
                                header.dataset.order = newOrder;
                                sortTable(sortBy, newOrder);
                            });
                        });

                        function sortTable(sortBy, order) {
                            const tbody = document.querySelector('.repair-table tbody');
                            const rows = Array.from(tbody.querySelectorAll('tr'));

                            rows.sort((a, b) => {
                                const aValue = getCellValue(a, sortBy);
                                const bValue = getCellValue(b, sortBy);

                                if (typeof aValue === 'string' && typeof bValue === 'string') {
                                    return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                                } else {
                                    return order === 'asc' ? aValue - bValue : bValue - aValue;
                                }
                            });

                            rows.forEach(row => tbody.appendChild(row));
                        }

                        function getCellValue(row, sortBy) {
                            let value;
                            switch (sortBy) {
                                case 'product_type':
                                    value = row.querySelector('td:nth-child(1) div:nth-child(1)').innerText;
                                    break;
                                case 'user_id':
                                    value = row.querySelector('td:nth-child(2)').innerText;
                                    break;
                                case 'product_model':
                                    value = row.querySelector('td:nth-child(3)').innerText;
                                    break;
                                case 'issue_description':
                                    value = row.querySelector('td:nth-child(4)').innerText;
                                    break;
                                case 'pickup_date':
                                    value = new Date(row.querySelector('td:nth-child(5)').innerText).getTime();
                                    break;
                                case 'status':
                                    value = row.querySelector('td:nth-child(6) strong').innerText;
                                    break;
                                case 'estimated_cost':
                                    value = parseFloat(row.querySelector('td:nth-child(7) input').value) || 0;
                                    break;
                                case 'payment_status':
                                    value = row.querySelector('td:nth-child(8) span').innerText;
                                    break;
                                default:
                                    value = '';
                            }
                            return value;
                        }

                        document.querySelectorAll('.status-dropdown').forEach(dropdown => {
                            dropdown.addEventListener('change', (e) => {
                                const repairId = e.target.id.split("status-")[1];
                                const newStatus = e.target.value;
                                const statusTd = e.target.closest('td');
                                if (statusTd) {
                                    let msgBox = statusTd.querySelector(`#msg-${repairId}`);
                                    if (!msgBox) {
                                        msgBox = document.createElement('div');
                                        msgBox.id = `msg-${repairId}`;
                                        msgBox.className = 'msg-box';
                                        statusTd.appendChild(msgBox);
                                    }
                                    msgBox.innerHTML = "⚠️ Status will update after clicking 'Update' button.";
                                }
                            });

                            // Store original status when dropdown is initialized
                            dropdown.setAttribute('data-original-status', dropdown.value);
                        });


                        window.removeReport = async function (repairId, reportUrl) {
                            if (!confirm("Delete this report?")) return;
                            const filePath = reportUrl.split("/").slice(-2).join("/");
                            const { error: deleteFileError } = await supabaseClient
                                .storage
                                .from("repair-reports")
                                .remove([filePath]);
                            if (deleteFileError) {
                                alert("❌ Failed to delete file: " + deleteFileError.message);
                                return;
                            }
                            const { error: deleteRowError } = await supabaseClient
                                .from("repair_reports")
                                .delete()
                                .eq("repair_id", repairId)
                                .eq("report_url", reportUrl);
                            if (deleteRowError) {
                                alert("❌ Failed to delete report record.");
                                return;
                            }
                            const reportLinkContainer = document.getElementById(`report-link-${repairId}`);
                            if (reportLinkContainer) {
                                reportLinkContainer.innerHTML = '';
                                const fileInput = document.getElementById(`file-${repairId}`);
                                if (fileInput) {
                                    fileInput.value = '';
                                    fileInput.style.display = '';
                                }
                            }
                        };

                        window.trashRepair = async function (repairId) {
                            if (!confirm("Are you sure you want to move this repair to trash?")) return;
                            const msgBox = document.getElementById(`msg-${repairId}`);
                            msgBox.innerText = "Moving to trash...";
                            const { error } = await supabaseClient
                                .from("repairs")
                                .update({ is_trashed: true })
                                .eq("id", repairId);
                            if (error) {
                                msgBox.innerText = "❌ Failed to trash repair: " + error.message;
                                console.error(error);
                                return;
                            }
                            msgBox.innerText = "✅ Repair moved to trash!";
                            // Remove the row from the table
                            const row = document.querySelector(`button[data-id="${repairId}"]`).closest('tr');
                            if (row) {
                                row.remove();
                            }
                        };

                        document.querySelectorAll('.trash-btn').forEach(btn => {
                            btn.addEventListener('click', () => {
                                const repairId = btn.dataset.id;
                                window.trashRepair(repairId);
                            });
                        });
                    });
                </script>
            </div>
            <?php
        },
        'dashicons-hammer',
        26
    );
});
