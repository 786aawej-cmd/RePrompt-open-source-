// Settings UI Logic with Multi-Agent Support

interface Agent {
    id: string;
    name: string;
    shortcut: string;
    shortcutKey: string;
    systemPrompt: string;
    isBuiltIn: boolean;
    enabled: boolean;
    icon?: string;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Elements - API Key
    const apiKeyInput = document.getElementById('api-key-input') as HTMLInputElement;
    const toggleVisibilityBtn = document.getElementById('toggle-visibility') as HTMLButtonElement;
    const saveApiKeyBtn = document.getElementById('save-api-key') as HTMLButtonElement;
    const deleteApiKeyBtn = document.getElementById('delete-api-key') as HTMLButtonElement;
    const apiMessage = document.getElementById('api-message') as HTMLDivElement;
    const apiStatus = document.getElementById('api-status') as HTMLSpanElement;

    // Elements - Shortcuts
    const shortcutStatus = document.getElementById('shortcut-status') as HTMLSpanElement;
    const toggleShortcutBtn = document.getElementById('toggle-shortcut') as HTMLButtonElement;

    // Elements - Agents
    const agentsList = document.getElementById('agents-list') as HTMLDivElement;
    const addCustomAgentBtn = document.getElementById('add-custom-agent') as HTMLButtonElement;
    const agentsStatus = document.getElementById('agents-status') as HTMLSpanElement;

    // Elements - Modal
    const agentModal = document.getElementById('agent-modal') as HTMLDivElement;
    const modalTitle = document.getElementById('modal-title') as HTMLHeadingElement;
    const modalCloseBtn = document.getElementById('modal-close') as HTMLButtonElement;
    const modalCancelBtn = document.getElementById('modal-cancel') as HTMLButtonElement;
    const modalSaveBtn = document.getElementById('modal-save') as HTMLButtonElement;
    const agentNameInput = document.getElementById('agent-name') as HTMLInputElement;
    const agentIconInput = document.getElementById('agent-icon') as HTMLInputElement;
    const agentShortcutKeyInput = document.getElementById('agent-shortcut-key') as HTMLInputElement;
    const agentPromptInput = document.getElementById('agent-prompt') as HTMLTextAreaElement;
    const shortcutHint = document.getElementById('shortcut-hint') as HTMLSpanElement;

    // Elements - Window Controls
    const closeBtn = document.getElementById('close-btn') as HTMLButtonElement;
    const minimizeBtn = document.getElementById('minimize-btn') as HTMLButtonElement;
    const maximizeBtn = document.getElementById('maximize-btn') as HTMLButtonElement;
    const getApiKeyLink = document.getElementById('get-api-key-link') as HTMLAnchorElement;

    // Elements - Sidebar & Pages
    const sidebarItems = document.querySelectorAll('.sidebar-item[data-page]') as NodeListOf<HTMLButtonElement>;
    const pages = document.querySelectorAll('.page') as NodeListOf<HTMLDivElement>;

    // State
    let currentEditingAgentId: string | null = null;

    // Initialize UI
    await initializeUI();

    // ===== SIDEBAR NAVIGATION =====
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageName = item.dataset.page;
            if (!pageName) return;

            // Update active sidebar item
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Show corresponding page
            pages.forEach(page => {
                page.style.display = page.id === `page-${pageName}` ? 'block' : 'none';
            });

            // Render agents if switching to agents page
            if (pageName === 'agents') {
                renderAgents();
            }
        });
    });

    // ===== WINDOW CONTROLS =====
    closeBtn.addEventListener('click', () => {
        window.electronAPI.closeWindow();
    });

    minimizeBtn.addEventListener('click', () => {
        window.electronAPI.minimizeWindow();
    });

    maximizeBtn.addEventListener('click', () => {
        window.electronAPI.maximizeWindow();
    });

    // ===== API KEY MANAGEMENT =====
    toggleVisibilityBtn.addEventListener('click', () => {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';
        toggleVisibilityBtn.textContent = isPassword ? '🙈' : '👁';
    });

    saveApiKeyBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            showMessage('Please enter an API key', 'error');
            return;
        }

        if (!apiKey.startsWith('gsk_')) {
            showMessage('Invalid API key format. Groq keys start with "gsk_"', 'error');
            return;
        }

        const success = await window.electronAPI.setApiKey(apiKey);

        if (success) {
            showMessage('API key saved successfully!', 'success');
            updateApiStatus(true);
            apiKeyInput.value = '';
            apiKeyInput.placeholder = '••••••••••••••••••••••••••••••••';
        } else {
            showMessage('Failed to save API key', 'error');
        }
    });

    deleteApiKeyBtn.addEventListener('click', async () => {
        const success = await window.electronAPI.deleteApiKey();

        if (success) {
            showMessage('API key deleted', 'success');
            updateApiStatus(false);
            apiKeyInput.placeholder = 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
        } else {
            showMessage('Failed to delete API key', 'error');
        }
    });

    // ===== SHORTCUTS =====
    toggleShortcutBtn.addEventListener('click', async () => {
        const enabled = await window.electronAPI.toggleShortcut();
        updateShortcutStatus(enabled);
        updateAgentsStatus();
    });

    // ===== CUSTOM AGENT MODAL =====
    addCustomAgentBtn.addEventListener('click', () => {
        currentEditingAgentId = null;
        modalTitle.textContent = 'Add Custom Agent';
        agentNameInput.value = '';
        agentIconInput.value = '🤖';
        agentShortcutKeyInput.value = '';
        agentPromptInput.value = '';
        shortcutHint.textContent = '';
        shortcutHint.className = 'input-hint';
        agentModal.classList.add('active');
    });

    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);

    agentShortcutKeyInput.addEventListener('input', async () => {
        const key = agentShortcutKeyInput.value.toUpperCase();
        agentShortcutKeyInput.value = key;

        if (key.length === 1) {
            const available = await window.electronAPI.isShortcutAvailable(key, currentEditingAgentId || undefined);
            if (available) {
                shortcutHint.textContent = `Shortcut: Ctrl+Shift+${key}`;
                shortcutHint.className = 'input-hint success';
            } else {
                shortcutHint.textContent = 'This shortcut is already in use';
                shortcutHint.className = 'input-hint error';
            }
        } else {
            shortcutHint.textContent = '';
            shortcutHint.className = 'input-hint';
        }
    });

    modalSaveBtn.addEventListener('click', async () => {
        const name = agentNameInput.value.trim();
        const icon = agentIconInput.value.trim() || '🤖';
        const shortcutKey = agentShortcutKeyInput.value.toUpperCase().trim();
        const systemPrompt = agentPromptInput.value.trim();

        if (!name) {
            alert('Please enter an agent name');
            return;
        }

        if (!shortcutKey || shortcutKey.length !== 1) {
            alert('Please enter a single character for the shortcut key');
            return;
        }

        if (!systemPrompt) {
            alert('Please enter a system prompt');
            return;
        }

        const available = await window.electronAPI.isShortcutAvailable(shortcutKey, currentEditingAgentId || undefined);
        if (!available) {
            alert('This shortcut key is already in use');
            return;
        }

        const agentData = {
            name,
            icon,
            shortcut: `Ctrl+Shift+${shortcutKey}`,
            shortcutKey,
            systemPrompt,
            enabled: true
        };

        if (currentEditingAgentId) {
            await window.electronAPI.updateAgent(currentEditingAgentId, agentData);
        } else {
            await window.electronAPI.addAgent(agentData);
        }

        closeModal();
        await renderAgents();
    });

    // ===== EXTERNAL LINKS =====
    getApiKeyLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('https://console.groq.com/keys', '_blank');
    });

    // ===== HELPER FUNCTIONS =====
    async function initializeUI(): Promise<void> {
        // Check API key status
        const hasApiKey = await window.electronAPI.hasApiKey();
        updateApiStatus(hasApiKey);

        if (hasApiKey) {
            apiKeyInput.placeholder = '••••••••••••••••••••••••••••••••';
        }

        // Check shortcut status
        const shortcutEnabled = await window.electronAPI.getShortcutEnabled();
        updateShortcutStatus(shortcutEnabled);

        // Render agents
        await renderAgents();
    }

    async function renderAgents(): Promise<void> {
        const agents: Agent[] = await window.electronAPI.getAgents();
        agentsList.innerHTML = '';

        agents.forEach(agent => {
            const agentItem = document.createElement('div');
            agentItem.className = 'agent-item';
            agentItem.innerHTML = `
                <div class="agent-info">
                    <span class="agent-icon">${agent.icon || '✨'}</span>
                    <div class="agent-details">
                        <span class="agent-name">${agent.name}</span>
                        <span class="agent-shortcut">${agent.shortcut}</span>
                    </div>
                </div>
                <div class="agent-controls">
                    <label class="toggle-switch">
                        <input type="checkbox" ${agent.enabled ? 'checked' : ''} data-agent-id="${agent.id}">
                        <span class="toggle-slider"></span>
                    </label>
                    ${!agent.isBuiltIn ? `<button class="btn-delete" data-agent-id="${agent.id}" title="Delete">🗑</button>` : ''}
                </div>
            `;

            // Toggle event
            const toggle = agentItem.querySelector('input[type="checkbox"]') as HTMLInputElement;
            toggle.addEventListener('change', async () => {
                await window.electronAPI.setAgentEnabled(agent.id, toggle.checked);
                updateAgentsStatus();
            });

            // Delete event (only for custom agents)
            const deleteBtn = agentItem.querySelector('.btn-delete') as HTMLButtonElement;
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async () => {
                    if (confirm(`Delete "${agent.name}" agent?`)) {
                        await window.electronAPI.deleteAgent(agent.id);
                        await renderAgents();
                    }
                });
            }

            agentsList.appendChild(agentItem);
        });

        updateAgentsStatus();
    }

    function updateApiStatus(configured: boolean): void {
        if (configured) {
            apiStatus.textContent = 'Configured';
            apiStatus.className = 'badge badge-success';
        } else {
            apiStatus.textContent = 'Not configured';
            apiStatus.className = 'badge badge-error';
        }
    }

    function updateShortcutStatus(enabled: boolean): void {
        if (enabled) {
            shortcutStatus.textContent = 'Enabled';
            shortcutStatus.className = 'badge badge-success';
        } else {
            shortcutStatus.textContent = 'Disabled';
            shortcutStatus.className = 'badge badge-warning';
        }
    }

    async function updateAgentsStatus(): Promise<void> {
        const agents: Agent[] = await window.electronAPI.getAgents();
        const enabledCount = agents.filter(a => a.enabled).length;

        if (enabledCount > 0) {
            agentsStatus.textContent = `${enabledCount} Active`;
            agentsStatus.className = 'badge badge-success';
        } else {
            agentsStatus.textContent = 'None Active';
            agentsStatus.className = 'badge badge-warning';
        }
    }

    function closeModal(): void {
        agentModal.classList.remove('active');
        currentEditingAgentId = null;
    }

    function showMessage(text: string, type: 'success' | 'error'): void {
        apiMessage.textContent = text;
        apiMessage.className = `message ${type}`;

        setTimeout(() => {
            apiMessage.textContent = '';
            apiMessage.className = 'message';
        }, 3000);
    }
});
