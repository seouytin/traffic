(function() {
    const CONTAINER_ID = 'sys-action-box';
    const PASS_CODE_LIST = ['DNroBMW']; 
    const HOVER_BRIGHTNESS = 0.95; 
    let currentPassCode = ''; 
    let seconds = 70;
    let interval;
    let counting = false;
    let incognitoChecked = false; 
    let isPausedByScroll = false;
    let scrollTimeout;
    const SCROLL_STOP_DELAY = 35000; 
    const SCROLL_ALERT_MESSAGE = 'Vui lòng thực hiện thao tác cuộn để tiếp tục đếm ngược thời gian!';
    const REF_DOMAIN_LIST = ["google.com","google.ad","google.ae","google.com.af","google.com.ag","google.com.ai","google.al","google.am","google.co.ao","google.com.ar","google.as","google.at","google.com.au","google.az","google.ba","google.com.bd","google.be","google.bf","google.bg","google.com.bh","google.bi","google.bj","google.com.bn","google.com.bo","google.com.br","google.bs","google.bt","google.co.bw","google.by","google.com.bz","google.ca","google.cd","google.cf","google.cg","google.ch","google.ci","google.co.ck","google.cl","google.cm","google.cn","google.com.co","google.co.cr","google.com.cu","google.cv","google.com.cy","google.cz","google.de","google.dj","google.dk","google.dm","google.com.do","google.dz","google.com.ec","google.ee","google.com.eg","google.es","google.com.et","google.fi","google.com.fj","google.fm","google.fr","google.ga","google.ge","google.gg","google.com.gh","google.com.gi","google.gl","google.gm","google.gr","google.com.gt","google.gy","google.com.hk","google.hn","google.hr","google.ht","google.hu","google.co.id","google.ie","google.co.il","google.im","google.co.in","google.iq","google.is","google.it","google.je","google.com.jm","google.jo","google.co.jp","google.co.ke","google.com.kh","google.ki","google.kg","google.co.kr","google.com.kw","google.kz","google.la","google.com.lb","google.li","google.lk","google.co.ls","google.lt","google.lu","google.lv","google.com.ly","google.co.ma","google.md","google.me","google.mg","google.mk","google.ml","google.com.mm","google.mn","google.ms","google.com.mt","google.mu","google.mv","google.mw","google.com.mx","google.com.my","google.co.mz","google.com.na","google.com.ng","google.com.ni","google.ne","google.nl","google.no","google.com.np","google.nr","google.nu","google.co.nz","google.com.om","google.com.pa","google.com.pe","google.com.pg","google.com.ph","google.com.pk","google.pl","google.pn","google.com.pr","google.ps","google.pt","google.com.py","google.com.qa","google.ro","google.ru","google.rw","google.com.sa","google.com.sb","google.sc","google.se","google.com.sg","google.sh","google.si","google.sk","google.com.sl","google.sn","google.so","google.sm","google.sr","google.st","google.com.sv","google.td","google.tg","google.co.th","google.com.tj","google.tl","google.tm","google.tn","google.to","google.com.tr","google.tt","google.com.tw","google.co.tz","google.com.ua","google.co.ug","google.co.uk","google.com.uy","google.co.uz","google.com.vc","google.co.ve","google.vg","google.co.vi","google.com.vn","google.vu","google.ws","google.rs","google.co.za","google.co.zm","google.co.zw","google.cat"];
    const PRIVATE_MODE_MESSAGE = 'Vui lòng tắt chế độ ẩn danh';
    const BASE_COLOR = '#EE2F2E'; 
     
    function getRandomPassCode() {
        const randomIndex = Math.floor(Math.random() * PASS_CODE_LIST.length);
        return PASS_CODE_LIST[randomIndex];
    }

    function copyToClipboard(text, alertElement) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alertElement.style.setProperty('display', 'block', 'important');
                setTimeout(() => { alertElement.style.setProperty('display', 'none', 'important'); }, 1500);
            });
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = 'fixed';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                alertElement.style.setProperty('display', 'block', 'important');
                setTimeout(() => { alertElement.style.setProperty('display', 'none', 'important'); }, 1500);
            } catch (err) {
                alert("Không thể sao chép. Trình duyệt không hỗ trợ.");
            }
            document.body.removeChild(textArea);
        }
    }

    function checkGoogleReferrer() {
        const referrer = document.referrer;
        if (!referrer) return false;
        try {
            const refURL = new URL(referrer);
            const refHostname = refURL.hostname.replace(/^www\./, '');
            for (const domain of REF_DOMAIN_LIST) {
                if (refHostname === domain) return true;
            }
        } catch(e) {
            return false;
        }
        return false;
    }

    if (!checkGoogleReferrer()) return;

    const container = document.getElementById(CONTAINER_ID);
    if (!container) {
        console.error(`Không tìm thấy container có ID: ${CONTAINER_ID}`);
        return;
    }

    const style = document.createElement('style');
    style.textContent = `
        .custom-button-${CONTAINER_ID} {
            box-sizing: border-box !important;
            /* Đồng bộ hiệu ứng màu nền giống nút chuẩn phía dưới */
            background: radial-gradient(circle at 50% 30%, #ff5252 0%, #e60000 60%, #b30000 100%) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            color: #fff !important;
            border-radius: 50% !important;
            width: 50px !important;
            height: 50px !important;
            max-width: 50px !important;
            max-height: 50px !important;
            flex-shrink: 0 !important;
            margin: 5px !important;
            padding: 0 !important;
            cursor: pointer !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            z-index: 999 !important;
            user-select: none !important;
            transition: all 0.2s ease !important;
            position: relative !important; 
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3) !important;
            font-weight: 700 !important;
            font-size: 16px !important;
            line-height: normal !important;
        }
        .custom-button-${CONTAINER_ID}:hover {
            filter: brightness(${HOVER_BRIGHTNESS}) !important;
        }
        .custom-button-${CONTAINER_ID}.disabled-state:hover {
            filter: none !important;
        }
        .custom-button-${CONTAINER_ID} svg {
            box-sizing: border-box !important;
            width: 24px !important;
            height: 24px !important;
            fill: #ffffff !important;
            display: block !important;
            margin: 0 auto !important;
            padding: 0 !important;
            /* Dịch nhẹ sang phải một xíu để icon Play có thị giác nằm chính xác tâm nút tròn */
            transform: translateX(1.5px) !important;
        }
        .custom-button-${CONTAINER_ID}.alert-state,
        .custom-button-${CONTAINER_ID}.finished-state {
            border-radius: 6px !important;
            width: auto !important;
            height: auto !important;
            max-width: none !important;
            max-height: none !important;
            padding: 8px 16px !important;
            font-size: 18px !important;
        }
        .custom-button-${CONTAINER_ID}.disabled-state {
            cursor: not-allowed !important;
        }
        .custom-button-${CONTAINER_ID} span {
            box-sizing: border-box !important;
            color: inherit !important;
            font-weight: 700 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            line-height: 1 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        #copy-alert-${CONTAINER_ID} {
            position: absolute !important;
            bottom: 130% !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background: #4CAF50 !important; 
            color: white !important;
            padding: 6px 14px !important;
            border-radius: 5px !important;
            display: none !important;
            z-index: 99999 !important;
            font-weight: bold !important;
            font-size: 14px !important;
            white-space: nowrap !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important;
        }
        #copy-alert-${CONTAINER_ID}::after {
            content: "" !important;
            position: absolute !important;
            top: 100% !important;
            left: 50% !important;
            margin-left: -6px !important;
            border-width: 6px !important;
            border-style: solid !important;
            border-color: #4CAF50 transparent transparent transparent !important;
        }
        #scroll-alert-${CONTAINER_ID} {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            padding: 15px 25px !important;
            background: rgba(238, 47, 46, 0.98) !important;
            color: #ffffff !important; 
            font-weight: 700 !important;
            font-size: 16px !important;
            border-radius: 10px !important;
            text-align: center !important;
            line-height: 1.5 !important;
            z-index: 99999 !important;
            display: none;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.5) !important;
            animation: border-pulse-${CONTAINER_ID} 1s infinite alternate !important; 
        }
        @keyframes border-pulse-${CONTAINER_ID} {
            0% { box-shadow: 0 0 0px rgba(255, 255, 255, 0), 0 0 5px rgba(238, 47, 46, 0.8); }
            50% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(238, 47, 46, 0.9); }
            100% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 15px rgba(238, 47, 46, 1); }
        }
    `;
    document.head.appendChild(style);

    const buttonId = `get-code-btn-${CONTAINER_ID}`;
    const textId = `button-text-${CONTAINER_ID}`;
    const scrollAlertId = `scroll-alert-${CONTAINER_ID}`;
 
    container.innerHTML = `
        <span id="${buttonId}" class="custom-button-${CONTAINER_ID}">
            <span id="${textId}">
                <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </span>
            <div id="copy-alert-${CONTAINER_ID}">Đã sao chép mã!</div>
        </span>
    `;

    const scrollAlertHtml = `<div id="${scrollAlertId}">${SCROLL_ALERT_MESSAGE}</div>`;
    document.body.insertAdjacentHTML('beforeend', scrollAlertHtml);

    const btn = document.getElementById(buttonId);
    const btnText = document.getElementById(textId);
    const alertElement = document.getElementById(`copy-alert-${CONTAINER_ID}`);
    const scrollAlertElement = document.getElementById(scrollAlertId);
 
    function copyCodeHandler() {
        copyToClipboard(currentPassCode, alertElement); 
    }

    function updateCountdown() {
        if (seconds > 0) {
            btnText.textContent = seconds;
            seconds--;
        } else {
            clearInterval(interval);
            interval = null;
            counting = false;
            incognitoChecked = false; 
 
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollAlertElement.style.display = 'none';
            isPausedByScroll = false;

            btn.style.background = BASE_COLOR; 
            btn.classList.remove('disabled-state');
            btn.classList.remove('alert-state'); 
 
            btn.classList.add('finished-state'); 
            btn.style.cursor = 'pointer';
 
            btnText.innerHTML = `${currentPassCode} <svg viewBox="0 0 24 24" style="height: 18px !important; width: 18px !important; margin: -4px 0 0 6px !important; vertical-align: middle; display: inline-block; fill: #ffffff;"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
            btn.removeEventListener('click', checkIncognitoAndStart);
            btn.addEventListener('click', copyCodeHandler);
        }
    }

    function pauseCountdown() {
        if (!counting || isPausedByScroll || seconds <= 0 || interval === null) return;
        clearInterval(interval);
        interval = null;
        isPausedByScroll = true;
    }

    function resumeCountdown() {
        if (!counting || !isPausedByScroll || seconds <= 0 || interval !== null) return;
        btnText.textContent = seconds; 
        interval = setInterval(updateCountdown, 1000);
        isPausedByScroll = false;
    }

    function showScrollAlert() {
        if (counting && seconds > 0 && !isPausedByScroll) {
            scrollAlertElement.style.display = 'block';
            pauseCountdown(); 
        }
    }

    function hideScrollAlert() {
        if (scrollAlertElement) scrollAlertElement.style.display = 'none';
        resumeCountdown(); 
    }

    function setScrollStopTimeout() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
        }
        scrollTimeout = setTimeout(showScrollAlert, SCROLL_STOP_DELAY);
    }

    function handleScroll() {
        if (!counting || seconds <= 0) return;
        hideScrollAlert();
        setScrollStopTimeout();
    }

    function startCountdown() {
        if (counting || seconds <= 0) return; 
        currentPassCode = getRandomPassCode();
 
        counting = true;
        incognitoChecked = true;
        btn.style.background = BASE_COLOR;
        btn.classList.add('disabled-state');
        btn.style.cursor = 'not-allowed';
        btn.removeEventListener('click', checkIncognitoAndStart); 
        updateCountdown();
        interval = setInterval(updateCountdown, 1000);
 
        window.addEventListener('scroll', handleScroll);
        setScrollStopTimeout();
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            if (interval) { clearInterval(interval); interval = null; }
            if (scrollTimeout) { clearTimeout(scrollTimeout); scrollTimeout = null; }
            if (scrollAlertElement) scrollAlertElement.style.display = 'none';
        } else {
            if (interval === null && seconds > 0 && counting && !isPausedByScroll) { 
                btn.style.background = BASE_COLOR;
                updateCountdown();
                interval = setInterval(updateCountdown, 1000);
            }
            if (counting && seconds > 0) {
                setScrollStopTimeout(); 
            }
        }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    function checkIncognitoAndStart() {
        if (incognitoChecked && counting) return;
        detectIncognito().then((result) => {
            if (result.isPrivate) {
                alert(PRIVATE_MODE_MESSAGE);
            } else {
                incognitoChecked = true; 
                startCountdown();
            }
        });
    }

    btn.addEventListener('click', checkIncognitoAndStart);

    const detectIncognito = function () {
        return new Promise(function (resolve) {
            var browserName = "Unknown";
            function __callback(isPrivate) { resolve({ isPrivate: isPrivate, browserName: browserName }); }
            function identifyChromium() {
                var ua = navigator.userAgent;
                if (ua.match(/Chrome/)) {
                    if (navigator.brave !== undefined) return "Brave";
                    else if (ua.match(/Edg/)) return "Edge";
                    else if (ua.match(/OPR/)) return "Opera";
                    return "Chrome";
                } else return "Chromium";
            }
            function assertEvalToString(value) { return value === eval.toString().length; }
            function isSafari() { var v = navigator.vendor; return (v !== undefined && v.indexOf("Apple") === 0 && assertEvalToString(37)); }
            function isChrome() { var v = navigator.vendor; return (v !== undefined && v.indexOf("Google") === 0 && assertEvalToString(33)); }
            function isFirefox() { return (document.documentElement !== undefined && document.documentElement.style.MozAppearance !== undefined && assertEvalToString(37)); }
            function isMSIE() { return (navigator.msSaveBlob !== undefined && assertEvalToString(39)); }
            function newSafariTest() {
                var tmp_name = String(Math.random());
                try {
                    var db = window.indexedDB.open(tmp_name, 1);
                    db.onupgradeneeded = function (i) {
                        var _a, _b;
                        var res = (_a = i.target) === null || _a === void 0 ? void 0 : _a.result;
                        try { res.createObjectStore("test", { autoIncrement: true }).put(new Blob); __callback(false); } 
                        catch (e) { var message = e; if (e instanceof Error) message = (_b = e.message) !== null && _b !== void 0 ? _b : e; if (typeof message !== 'string') return __callback(false); var matchesExpectedError = /BlobURLs are not yet supported/.test(message); return __callback(matchesExpectedError); } 
                        finally { res.close(); window.indexedDB.deleteDatabase(tmp_name); }
                    };
                } catch (e) { return __callback(false); }
            }
            function oldSafariTest() {
                var openDB = window.openDatabase; var storage = window.localStorage;
                try { openDB(null, null, null, null); } catch (e) { return __callback(true); }
                try { storage.setItem("test", "1"); storage.removeItem("test"); } catch (e) { return __callback(true); }
                return __callback(false);
            }
            function main() {
                if (isSafari()) { browserName = 'Safari'; if (navigator.maxTouchPoints !== undefined) newSafariTest(); else oldSafariTest(); }
                else if (isChrome()) { browserName = identifyChromium(); if (self.Promise !== undefined && self.Promise.allSettled !== undefined) { navigator.webkitTemporaryStorage.queryUsageAndQuota(function (_, quota) { var quotaInMib = Math.round(quota / (1024 * 1024)); var quotaLimitInMib = Math.round((performance.memory ? performance.memory.jsHeapSizeLimit : 1073741824) / (1024 * 1024)) * 2; __callback(quotaInMib < quotaLimitInMib); }, function () { resolve({isPrivate: false}); }); } else { var fs = window.webkitRequestFileSystem; fs(0, 1, function () { __callback(false); }, function () { __callback(true); }); } }
                else if (isFirefox()) { browserName = "Firefox"; __callback(navigator.serviceWorker === undefined); }
                else if (isMSIE()) { browserName = "Internet Explorer"; __callback(window.indexedDB === undefined); }
                else __callback(false);
            }
            main();
        });
    };
})();
