/**
 * WriteGenie AI — Frontend Logic
 * Handles tool switching, API calls, and UI interactions
 */

// ============================================================
// STATE
// ============================================================
let currentTool = 'email';
let currentResult = '';
let selectedTone = 'professional';
let selectedPlatform = 'LinkedIn';
let selectedAdPlatform = 'Facebook/Instagram';
let selectedLength = 'medium';

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initToolTabs();
    initToneButtons();
    initPlatformButtons();
    initLengthButtons();
    loadStats();
    initSmoothScroll();
    initNavbarScroll();
});

// ============================================================
// TOOL TAB SWITCHING
// ============================================================
function initToolTabs() {
    document.querySelectorAll('.tool-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tool = tab.dataset.tool;
            
            // Update active tab
            document.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active panel
            document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(`panel-${tool}`);
            if (panel) panel.classList.add('active');
            
            currentTool = tool;
        });
    });
}

// ============================================================
// BUTTON GROUP HANDLERS
// ============================================================
function initToneButtons() {
    document.querySelectorAll('.tone-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.tone-buttons').querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTone = btn.dataset.tone;
        });
    });
}

function initPlatformButtons() {
    document.querySelectorAll('.platform-buttons').forEach(group => {
        group.querySelectorAll('.platform-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                group.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Determine which platform group this is
                const panel = btn.closest('.tool-panel');
                if (panel && panel.id === 'panel-ad') {
                    selectedAdPlatform = btn.dataset.platform;
                } else {
                    selectedPlatform = btn.dataset.platform;
                }
            });
        });
    });
}

function initLengthButtons() {
    document.querySelectorAll('.length-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.length-buttons').querySelectorAll('.length-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedLength = btn.dataset.length;
        });
    });
}

// ============================================================
// CONTENT GENERATION
// ============================================================
async function generateContent(toolType) {
    const btn = document.getElementById(`btn-generate-${toolType}`);
    if (!btn) return;
    
    btn.classList.add('loading');
    btn.disabled = true;
    
    const startTime = Date.now();
    
    try {
        let endpoint = '';
        let payload = {};
        
        switch (toolType) {
            case 'email':
                endpoint = '/api/generate/email';
                payload = {
                    recipient: document.getElementById('email-recipient')?.value || '',
                    purpose: document.getElementById('email-purpose')?.value || 'cold outreach',
                    tone: selectedTone,
                    details: document.getElementById('email-details')?.value || ''
                };
                break;
                
            case 'social':
                endpoint = '/api/generate/social';
                payload = {
                    platform: selectedPlatform,
                    topic: document.getElementById('social-topic')?.value || '',
                    tone: document.getElementById('social-tone')?.value || 'professional',
                    details: document.getElementById('social-details')?.value || ''
                };
                break;
                
            case 'product':
                endpoint = '/api/generate/product';
                payload = {
                    product_name: document.getElementById('product-name')?.value || '',
                    category: document.getElementById('product-category')?.value || '',
                    features: document.getElementById('product-features')?.value || '',
                    target_audience: document.getElementById('product-audience')?.value || ''
                };
                break;
                
            case 'blog':
                endpoint = '/api/generate/blog';
                payload = {
                    title: document.getElementById('blog-title')?.value || '',
                    niche: document.getElementById('blog-niche')?.value || '',
                    keywords: document.getElementById('blog-keywords')?.value || '',
                    length: selectedLength
                };
                break;
                
            case 'ad':
                endpoint = '/api/generate/ad';
                payload = {
                    product_service: document.getElementById('ad-product')?.value || '',
                    platform: selectedAdPlatform,
                    objective: document.getElementById('ad-objective')?.value || 'conversions',
                    target_audience: document.getElementById('ad-audience')?.value || ''
                };
                break;
                
            case 'rewrite':
                endpoint = '/api/generate/rewrite';
                payload = {
                    original_text: document.getElementById('rewrite-original')?.value || '',
                    style: document.getElementById('rewrite-style')?.value || 'professional',
                    instruction: document.getElementById('rewrite-instruction')?.value || ''
                };
                break;
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        
        const data = await response.json();
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        
        currentResult = data.result;
        
        // Display result with typing effect
        const outputId = toolType === 'email' ? 'outputArea' : `outputArea-${toolType}`;
        const outputArea = document.getElementById(outputId);
        if (outputArea) {
            typeText(outputArea, data.result);
        }
        
        // Update meta (only for email panel which has meta)
        const metaEl = document.getElementById('outputMeta');
        const wordCountEl = document.getElementById('wordCount');
        const genTimeEl = document.getElementById('genTime');
        if (metaEl && wordCountEl && genTimeEl) {
            wordCountEl.textContent = data.words || currentResult.split(/\s+/).length;
            genTimeEl.textContent = elapsed;
            metaEl.style.display = 'flex';
        }
        
        // Refresh stats
        loadStats();
        
    } catch (error) {
        const outputId = toolType === 'email' ? 'outputArea' : `outputArea-${toolType}`;
        const outputArea = document.getElementById(outputId);
        if (outputArea) {
            outputArea.innerHTML = `<div class="output-placeholder"><div class="placeholder-icon">⚠️</div><p>Error generating content: ${error.message}</p><p class="placeholder-sub">Make sure the server is running on port 5000.</p></div>`;
        }
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ============================================================
// TYPING EFFECT
// ============================================================
function typeText(element, text) {
    element.innerHTML = '';
    element.classList.add('typing-cursor');
    
    let index = 0;
    const chunkSize = 3; // characters per frame
    const speed = 8; // ms per frame
    
    function type() {
        if (index < text.length) {
            const chunk = text.substring(index, index + chunkSize);
            element.textContent += chunk;
            index += chunkSize;
            
            // Auto scroll down
            element.scrollTop = element.scrollHeight;
            
            requestAnimationFrame(() => setTimeout(type, speed));
        } else {
            element.classList.remove('typing-cursor');
        }
    }
    
    type();
}

// ============================================================
// COPY & DOWNLOAD
// ============================================================
function copyResult() {
    if (!currentResult) {
        showToast('Nothing to copy yet!');
        return;
    }
    
    navigator.clipboard.writeText(currentResult).then(() => {
        showToast('Copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = currentResult;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!');
    });
}

function downloadResult() {
    if (!currentResult) {
        showToast('Nothing to download yet!');
        return;
    }
    
    const blob = new Blob([currentResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `writegenie_${currentTool}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded successfully!');
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');
    if (toast && toastText) {
        toastText.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// ============================================================
// STATS LOADING
// ============================================================
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        animateNumber('statGenerations', data.total_generations || 0);
        animateNumber('statWords', data.total_words || 0);
        animateNumber('heroGenerations', data.total_generations || 0);
        animateNumber('heroWords', data.total_words || 0);
    } catch (e) {
        // Server might not be ready yet
    }
}

function animateNumber(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;
    
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        const value = Math.round(current + (target - current) * eased);
        
        el.textContent = value.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ============================================================
// NAVIGATION
// ============================================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 15, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        } else {
            navbar.style.background = 'rgba(10, 10, 15, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });
}

function scrollToTools() {
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
