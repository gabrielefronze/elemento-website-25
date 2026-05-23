/**
 * AtomOS Price Calculator — Component loader and logic
 * Usage: Add <div data-atomos-calculator></div> and include this script + atomos-calculator.css
 */
(function() {
    'use strict';

    const CONFIG = {
        vmwareVSphereFoundationPerCoreYear: 180,
        vmwareCloudFoundationPerCoreYear: 350,
        vmwareVSANPerTBYear: 120,
        vmwareSupportPercent: 18,
        atomosPerHostYear: 600,
        atomosSupportBase: 1200,
        atomosSupportPro: 2000,
        currency: '€',
        /* Nutanix: per-node/year (AHV+HCI bundle, estimated) */
        nutanixPerNodeYear: 4500,
        /* Sangfor HCI: per-node/year (estimated, typically lower than Nutanix) */
        sangforPerNodeYear: 3000,
        /* Hyper-V: Windows Server Datacenter per-core/year (amortized 5yr or subscription) */
        hypervPerCoreYear: 85
    };

    const comparisonLabels = {
        'vsphere-foundation': 'VMware vSphere Foundation + vSAN',
        'cloud-foundation': 'VMware Cloud Foundation (VCF)',
        'nutanix': 'Nutanix (AHV + HCI)',
        'sangfor': 'Sangfor HCI',
        'hyperv': 'Microsoft Hyper-V (Windows Server)'
    };

    const comparisonShortLabels = {
        'vsphere-foundation': 'VMware',
        'cloud-foundation': 'VMware',
        'nutanix': 'Nutanix',
        'sangfor': 'Sangfor',
        'hyperv': 'Hyper-V'
    };

    const comparisonsWithStoragePricing = ['vsphere-foundation', 'cloud-foundation'];
    const comparisonsWithCoresPricing = ['vsphere-foundation', 'cloud-foundation', 'hyperv'];

    function getLocale() {
        if (window.ElementoI18n?.getPageLocale) return window.ElementoI18n.getPageLocale();
        const i18nLocale = window.__I18N__?.locale;
        if (i18nLocale === 'it' || i18nLocale === 'fr') return i18nLocale;
        const lang = document.documentElement.lang;
        if (lang === 'it' || lang === 'fr') return lang;
        const path = window.location.pathname;
        if (path.startsWith('/it/') || path === '/it' || path === '/it/') return 'it';
        if (path.startsWith('/fr/') || path === '/fr' || path === '/fr/') return 'fr';
        return 'en';
    }

    const STRINGS = {
        en: {
            configureInfra: 'Configure your infrastructure',
            subscriptionLength: 'Subscription length',
            year1: '1 year',
            years3: '3 years',
            years5: '5 years',
            compareTo: 'Compare to',
            numberOfHosts: 'Number of hosts',
            coresPerHost: 'Cores per host',
            pricingIndependent: "Pricing doesn't depend on this",
            storageCapacity: 'Storage capacity (vSAN)',
            totalVms: 'Total VMs',
            costPerVmHint: 'Only used for cost per VM',
            configNote: 'VMware licenses per core (minimum 16 cores per CPU). Storage tier affects VMware vSAN pricing. AtomOS uses your existing storage. Nutanix, Sangfor, and Hyper-V estimates use published or typical list pricing; contact vendors for exact quotes.',
            downloadPdf: 'Download PDF report',
            downloadPdfAria: 'Download price comparison as PDF',
            costComparison: 'Cost comparison',
            howComputed: 'How did we compute that?',
            detailsIntro: 'Detailed breakdown of the cost comparison and computation.',
            costComponent: 'Cost component',
            hypervisorLicensing: 'Hypervisor licensing',
            storageVsan: 'Storage / vSAN',
            storage: 'Storage',
            managementSupport: 'Management & support',
            totalCost: 'Total cost',
            included: 'Included',
            chooseSupport: 'Choose AtomOS support level',
            supportBase: 'Base',
            supportPro: 'Pro',
            competitorTotal: '{label} total',
            atomosTotal: 'AtomOS total',
            savingsPct: 'Savings %',
            costPerVmYear: '{label} cost per VM/year',
            costPerHostYear: '{label} cost per host/year',
            disclaimer: 'Estimates based on published list pricing and typical configurations. VMware uses per-core licensing (minimum 16 cores per CPU). Nutanix/Sangfor: per-node HCI estimates. Hyper-V: Windows Server Datacenter per-core equivalent. AtomOS: paid tier (€600/host/year) with Base or Pro support; Community Edition is free but excluded. Actual costs may vary. Contact sales for exact quotes.',
            pageTitle: 'Compare Costs — AtomOS vs {compShort}',
            pageTitleSuffix: ' | Elemento Cloud',
            pageSubtitle: 'Calculate how much you could save with AtomOS compared to {compShort}. Discover how our virtualization solution helps you escape rising costs, without compromising enterprise-level reliability.',
            metaDescription: 'Calculate how much you could save with AtomOS compared to {compShort}. Compare virtualization costs and discover enterprise-level reliability at a fraction of the price.',
            metaDescriptionShort: 'Calculate how much you could save with AtomOS compared to {compShort}. Compare virtualization costs and discover enterprise-level reliability.',
            chartTitle: 'AtomOS vs {compLabel}',
            detailsSummary: 'How did we compute AtomOS vs {compLabel}?',
            detailsIntroDynamic: 'Detailed breakdown of AtomOS vs {compLabel} cost comparison and computation.',
            overPeriod: 'Over {period} • {count} {unit}',
            year: 'year',
            years: 'years',
            cores: 'cores',
            nodes: 'nodes',
            supportDetail: '{tier} support • {hosts} {hostLabel}',
            host: 'host',
            hosts: 'hosts',
            saveUpTo: 'Save up to {pct}%',
            savingsOver: '{amount} over {period}',
            savingsWithAtomos: 'With AtomOS instead of {compLabel}',
            competitorCostsLess: '{compLabel} costs {pct}% less',
            competitorSavingsOver: '{amount} less with {compLabel} over {period}',
            atomosExceeds: 'AtomOS total exceeds {compLabel} for this configuration',
            pdfUnavailable: 'PDF export is not available. Please ensure jsPDF is loaded.',
            pdfTitle: 'Price Comparison Report',
            pdfGenerated: 'Generated on {date}',
            pdfConfiguration: 'Configuration',
            pdfConfigLine: 'Hosts: {hosts}  |  Cores per host: {cores}  |  VMs: {vms}  |  Years: {years}',
            pdfConfigStorage: 'Storage (vSAN): {storage} TB  |  Elemento AtomOS support: {tier}',
            pdfConfigSupport: 'Elemento AtomOS support: {tier}',
            pdfCostBreakdown: 'Cost breakdown',
            pdfComponent: 'Component',
            pdfSavings: 'Savings',
            pdfSaveLine: 'Save {amount} ({pct}%) over {period} with Elemento AtomOS',
            pdfSupportLevel: 'Elemento AtomOS support level',
            pdfSupportSelected: 'Selected: {tier} ({price}/host/year)',
            pdfResultSummary: 'Result summary',
            pdfMetrics: 'Metrics',
            pdfMetricsLine: 'Savings: {pct}%  |  {compShort} cost per VM/year: {costVm}  |  Cost per host/year: {costHost}',
            pdfFooter: 'Estimates based on published list pricing and typical configurations. VMware uses per-core licensing (minimum 16 cores per CPU). Nutanix/Sangfor: per-node HCI estimates. Hyper-V: Windows Server Datacenter per-core equivalent. Elemento AtomOS: paid tier (€600/host/year) with Base or Pro support; Community Edition is free but excluded. Actual costs may vary. Contact sales for exact quotes. — Elemento | elemento.cloud',
            pdfReportTitle: 'Elemento AtomOS vs {compLabel}',
            loadError: 'Failed to load cost calculator. Please refresh the page.',
        },
        it: {
            configureInfra: 'Configura la tua infrastruttura',
            subscriptionLength: 'Durata dell\'abbonamento',
            year1: '1 anno',
            years3: '3 anni',
            years5: '5 anni',
            compareTo: 'Confronta con',
            numberOfHosts: 'Numero di host',
            coresPerHost: 'Core per host',
            pricingIndependent: 'Il prezzo non dipende da questo',
            storageCapacity: 'Capacità di storage (vSAN)',
            totalVms: 'VM totali',
            costPerVmHint: 'Usato solo per il costo per VM',
            configNote: 'Licenze VMware per core (minimo 16 core per CPU). Il livello di storage influisce sul prezzo di VMware vSAN. AtomOS usa lo storage esistente. Le stime Nutanix, Sangfor e Hyper-V si basano su listini pubblicati o tipici; contatta i vendor per preventivi esatti.',
            downloadPdf: 'Scarica report PDF',
            downloadPdfAria: 'Scarica il confronto prezzi in PDF',
            costComparison: 'Confronto costi',
            howComputed: 'Come abbiamo calcolato?',
            detailsIntro: 'Dettaglio del confronto costi e del calcolo.',
            costComponent: 'Voce di costo',
            hypervisorLicensing: 'Licenza hypervisor',
            storageVsan: 'Storage / vSAN',
            storage: 'Storage',
            managementSupport: 'Gestione e supporto',
            totalCost: 'Costo totale',
            included: 'Incluso',
            chooseSupport: 'Scegli il livello di supporto AtomOS',
            supportBase: 'Base',
            supportPro: 'Pro',
            competitorTotal: 'Totale {label}',
            atomosTotal: 'Totale AtomOS',
            savingsPct: 'Risparmio %',
            costPerVmYear: 'Costo {label} per VM/anno',
            costPerHostYear: 'Costo {label} per host/anno',
            disclaimer: 'Stime basate su listini pubblicati e configurazioni tipiche. VMware usa licenze per core (minimo 16 core per CPU). Nutanix/Sangfor: stime HCI per nodo. Hyper-V: equivalente Windows Server Datacenter per core. AtomOS: tier a pagamento (€600/host/anno) con supporto Base o Pro; Community Edition gratuita ma esclusa. I costi effettivi possono variare. Contatta il commerciale per preventivi esatti.',
            pageTitle: 'Confronta i costi: AtomOS e {compShort}',
            pageTitleSuffix: ' | Elemento Cloud',
            pageSubtitle: 'Calcola quanto potresti risparmiare con AtomOS rispetto a {compShort}. Scopri come la nostra soluzione di virtualizzazione ti aiuta a evitare l\'aumento dei costi, senza compromettere l\'affidabilità a livello aziendale.',
            metaDescription: 'Calcola quanto potresti risparmiare con AtomOS rispetto a {compShort}. Confronta i costi di virtualizzazione e scopri l\'affidabilità di livello aziendale a una frazione del prezzo.',
            metaDescriptionShort: 'Calcola quanto potresti risparmiare con AtomOS rispetto a {compShort}. Confronta i costi di virtualizzazione e scopri l\'affidabilità di livello aziendale.',
            chartTitle: 'AtomOS vs {compLabel}',
            detailsSummary: 'Come abbiamo calcolato AtomOS vs {compLabel}?',
            detailsIntroDynamic: 'Dettaglio del confronto costi AtomOS vs {compLabel} e del calcolo.',
            overPeriod: 'Per {period} • {count} {unit}',
            year: 'anno',
            years: 'anni',
            cores: 'core',
            nodes: 'nodi',
            supportDetail: 'Supporto {tier} • {hosts} {hostLabel}',
            host: 'host',
            hosts: 'host',
            saveUpTo: 'Risparmia fino al {pct}%',
            savingsOver: '{amount} in {period}',
            savingsWithAtomos: 'Con AtomOS invece di {compLabel}',
            competitorCostsLess: '{compLabel} costa il {pct}% in meno',
            competitorSavingsOver: '{amount} in meno con {compLabel} in {period}',
            atomosExceeds: 'Il totale AtomOS supera {compLabel} per questa configurazione',
            pdfUnavailable: 'Esportazione PDF non disponibile. Assicurati che jsPDF sia caricato.',
            pdfTitle: 'Report di confronto prezzi',
            pdfGenerated: 'Generato il {date}',
            pdfConfiguration: 'Configurazione',
            pdfConfigLine: 'Host: {hosts}  |  Core per host: {cores}  |  VM: {vms}  |  Anni: {years}',
            pdfConfigStorage: 'Storage (vSAN): {storage} TB  |  Supporto Elemento AtomOS: {tier}',
            pdfConfigSupport: 'Supporto Elemento AtomOS: {tier}',
            pdfCostBreakdown: 'Dettaglio costi',
            pdfComponent: 'Voce',
            pdfSavings: 'Risparmio',
            pdfSaveLine: 'Risparmio {amount} ({pct}%) in {period} con Elemento AtomOS',
            pdfSupportLevel: 'Livello di supporto Elemento AtomOS',
            pdfSupportSelected: 'Selezionato: {tier} ({price}/host/anno)',
            pdfResultSummary: 'Riepilogo risultati',
            pdfMetrics: 'Metriche',
            pdfMetricsLine: 'Risparmio: {pct}%  |  Costo {compShort} per VM/anno: {costVm}  |  Costo per host/anno: {costHost}',
            pdfFooter: 'Stime basate su listini pubblicati e configurazioni tipiche. VMware usa licenze per core (minimo 16 core per CPU). Nutanix/Sangfor: stime HCI per nodo. Hyper-V: equivalente Windows Server Datacenter per core. Elemento AtomOS: tier a pagamento (€600/host/anno) con supporto Base o Pro; Community Edition gratuita ma esclusa. I costi effettivi possono variare. Contatta il commerciale per preventivi esatti. — Elemento | elemento.cloud',
            pdfReportTitle: 'Elemento AtomOS vs {compLabel}',
            loadError: 'Impossibile caricare la calcolatrice. Ricarica la pagina.',
        },
        fr: {
            configureInfra: 'Configurez votre infrastructure',
            subscriptionLength: 'Durée de l\'abonnement',
            year1: '1 an',
            years3: '3 ans',
            years5: '5 ans',
            compareTo: 'Comparer avec',
            numberOfHosts: 'Nombre d\'hôtes',
            coresPerHost: 'Cœurs par hôte',
            pricingIndependent: 'Le prix ne dépend pas de ce paramètre',
            storageCapacity: 'Capacité de stockage (vSAN)',
            totalVms: 'VM totales',
            costPerVmHint: 'Utilisé uniquement pour le coût par VM',
            configNote: 'Licences VMware par cœur (minimum 16 cœurs par CPU). Le niveau de stockage affecte le prix VMware vSAN. AtomOS utilise votre stockage existant. Les estimations Nutanix, Sangfor et Hyper-V reposent sur des tarifs publics ou typiques ; contactez les éditeurs pour un devis exact.',
            downloadPdf: 'Télécharger le rapport PDF',
            downloadPdfAria: 'Télécharger la comparaison de prix en PDF',
            costComparison: 'Comparaison des coûts',
            howComputed: 'Comment avons-nous calculé ?',
            detailsIntro: 'Détail de la comparaison des coûts et du calcul.',
            costComponent: 'Poste de coût',
            hypervisorLicensing: 'Licence hyperviseur',
            storageVsan: 'Stockage / vSAN',
            storage: 'Stockage',
            managementSupport: 'Gestion et support',
            totalCost: 'Coût total',
            included: 'Inclus',
            chooseSupport: 'Choisissez le niveau de support AtomOS',
            supportBase: 'Base',
            supportPro: 'Pro',
            competitorTotal: 'Total {label}',
            atomosTotal: 'Total AtomOS',
            savingsPct: 'Économies %',
            costPerVmYear: 'Coût {label} par VM/an',
            costPerHostYear: 'Coût {label} par hôte/an',
            disclaimer: 'Estimations basées sur les tarifs publics et des configurations typiques. VMware : licence par cœur (minimum 16 cœurs par CPU). Nutanix/Sangfor : estimations HCI par nœud. Hyper-V : équivalent Windows Server Datacenter par cœur. AtomOS : offre payante (600 €/hôte/an) avec support Base ou Pro ; Community Edition gratuite mais exclue. Les coûts réels peuvent varier. Contactez les ventes pour un devis exact.',
            pageTitle: 'Comparer les coûts : AtomOS vs {compShort}',
            pageTitleSuffix: ' | Elemento Cloud',
            pageSubtitle: 'Calculez combien vous pourriez économiser avec AtomOS par rapport à {compShort}. Découvrez comment notre solution de virtualisation vous aide à maîtriser les coûts, sans compromettre la fiabilité entreprise.',
            metaDescription: 'Calculez combien vous pourriez économiser avec AtomOS par rapport à {compShort}. Comparez les coûts de virtualisation et découvrez une fiabilité entreprise à moindre coût.',
            metaDescriptionShort: 'Calculez combien vous pourriez économiser avec AtomOS par rapport à {compShort}. Comparez les coûts de virtualisation et découvrez une fiabilité entreprise.',
            chartTitle: 'AtomOS vs {compLabel}',
            detailsSummary: 'Comment avons-nous calculé AtomOS vs {compLabel} ?',
            detailsIntroDynamic: 'Détail de la comparaison des coûts AtomOS vs {compLabel} et du calcul.',
            overPeriod: 'Sur {period} • {count} {unit}',
            year: 'an',
            years: 'ans',
            cores: 'cœurs',
            nodes: 'nœuds',
            supportDetail: 'Support {tier} • {hosts} {hostLabel}',
            host: 'hôte',
            hosts: 'hôtes',
            saveUpTo: 'Économisez jusqu\'à {pct} %',
            savingsOver: '{amount} sur {period}',
            savingsWithAtomos: 'Avec AtomOS au lieu de {compLabel}',
            competitorCostsLess: '{compLabel} coûte {pct} % de moins',
            competitorSavingsOver: '{amount} de moins avec {compLabel} sur {period}',
            atomosExceeds: 'Le total AtomOS dépasse {compLabel} pour cette configuration',
            pdfUnavailable: 'Export PDF indisponible. Vérifiez que jsPDF est chargé.',
            pdfTitle: 'Rapport de comparaison des prix',
            pdfGenerated: 'Généré le {date}',
            pdfConfiguration: 'Configuration',
            pdfConfigLine: 'Hôtes : {hosts}  |  Cœurs par hôte : {cores}  |  VM : {vms}  |  Années : {years}',
            pdfConfigStorage: 'Stockage (vSAN) : {storage} To  |  Support Elemento AtomOS : {tier}',
            pdfConfigSupport: 'Support Elemento AtomOS : {tier}',
            pdfCostBreakdown: 'Détail des coûts',
            pdfComponent: 'Poste',
            pdfSavings: 'Économies',
            pdfSaveLine: 'Économie de {amount} ({pct} %) sur {period} avec Elemento AtomOS',
            pdfSupportLevel: 'Niveau de support Elemento AtomOS',
            pdfSupportSelected: 'Sélectionné : {tier} ({price}/hôte/an)',
            pdfResultSummary: 'Résumé des résultats',
            pdfMetrics: 'Indicateurs',
            pdfMetricsLine: 'Économies : {pct} %  |  Coût {compShort} par VM/an : {costVm}  |  Coût par hôte/an : {costHost}',
            pdfFooter: 'Estimations basées sur les tarifs publics et des configurations typiques. VMware : licence par cœur (minimum 16 cœurs par CPU). Nutanix/Sangfor : estimations HCI par nœud. Hyper-V : équivalent Windows Server Datacenter par cœur. Elemento AtomOS : offre payante (600 €/hôte/an) avec support Base ou Pro ; Community Edition gratuite mais exclue. Les coûts réels peuvent varier. Contactez les ventes pour un devis exact. — Elemento | elemento.cloud',
            pdfReportTitle: 'Elemento AtomOS vs {compLabel}',
            loadError: 'Impossible de charger le calculateur. Veuillez actualiser la page.',
        },
    };

    function t(key, vars) {
        const locale = getLocale();
        const table = STRINGS[locale] || STRINGS.en;
        let str = table[key] ?? STRINGS.en[key] ?? key;
        if (vars) {
            Object.keys(vars).forEach((k) => {
                str = str.split(`{${k}}`).join(String(vars[k]));
            });
        }
        return str;
    }

    function formatMoney(n) {
        const loc = getLocale();
        const numberLocale = loc === 'it' ? 'it-IT' : loc === 'fr' ? 'fr-FR' : 'en-US';
        return `${CONFIG.currency} ${n.toLocaleString(numberLocale, { maximumFractionDigits: 0 })}`;
    }

    function periodLabel(years) {
        if (getLocale() === 'it') {
            return years === 1 ? `1 ${t('year')}` : `${years} ${t('years')}`;
        }
        return years === 1 ? `1 ${t('year')}` : `${years} ${t('years')}`;
    }

    function hostsLabel(count) {
        if (getLocale() === 'it') return t('host');
        return count === 1 ? t('host') : t('hosts');
    }

    function localizeComponent(container) {
        const setLabel = (forId, key) => {
            const label = container.querySelector(`label[for="${forId}"]`);
            if (label) label.textContent = t(key);
        };
        const setText = (sel, key) => {
            const el = container.querySelector(sel);
            if (el) el.textContent = t(key);
        };

        setText('.atomos-config-header .step-title', 'configureInfra');
        setLabel('atomos-calc-subscription', 'subscriptionLength');
        setLabel('atomos-calc-comparison', 'compareTo');
        setLabel('atomos-calc-hosts', 'numberOfHosts');
        setLabel('atomos-calc-cores', 'coresPerHost');
        setLabel('atomos-calc-storage', 'storageCapacity');
        setLabel('atomos-calc-vms', 'totalVms');

        const sub = container.querySelector('#atomos-calc-subscription');
        if (sub) {
            const opts = sub.querySelectorAll('option');
            if (opts[0]) opts[0].textContent = t('year1');
            if (opts[1]) opts[1].textContent = t('years3');
            if (opts[2]) opts[2].textContent = t('years5');
        }

        setText('#atomos-calc-cores-hint', 'pricingIndependent');
        setText('#atomos-calc-storage-hint', 'pricingIndependent');
        setText('.atomos-compute-hint', 'costPerVmHint');
        setText('.atomos-config-section .config-note', 'configNote');

        const pdfBtn = container.querySelector('#atomos-calc-download-pdf');
        if (pdfBtn) {
            pdfBtn.setAttribute('aria-label', t('downloadPdfAria'));
            pdfBtn.innerHTML = `<i class="fas fa-file-pdf"></i> ${t('downloadPdf')}`;
        }

        setText('#atomos-calc-chart-title', 'costComparison');
        setText('#atomos-calc-details-summary', 'howComputed');
        setText('#atomos-calc-details-intro', 'detailsIntro');

        const table = container.querySelector('.comparison-table');
        if (table) {
            const ths = table.querySelectorAll('thead th');
            if (ths[0]) ths[0].textContent = t('costComponent');
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach((row, i) => {
                const label = row.querySelector('td:first-child');
                if (!label) return;
                if (i === 0) label.textContent = t('hypervisorLicensing');
                else if (i === 1) label.textContent = t('storageVsan');
                else if (i === 2) label.textContent = t('managementSupport');
                else if (i === 3) label.textContent = t('totalCost');
            });
        }

        setText('.support-level-title', 'chooseSupport');
        const supportCards = container.querySelectorAll('.support-level-card');
        supportCards.forEach((card) => {
            const name = card.querySelector('.support-level-name');
            const tier = card.getAttribute('data-value');
            if (name && tier === 'base') name.textContent = t('supportBase');
            if (name && tier === 'pro') name.textContent = t('supportPro');
        });

        const atomosResultLabel = container.querySelector('.result-card.atomos .label');
        if (atomosResultLabel) atomosResultLabel.textContent = t('atomosTotal');

        const metricLabels = container.querySelectorAll('.metric-box .metric-label');
        if (metricLabels[0]) metricLabels[0].textContent = t('savingsPct');

        const disclaimer = container.querySelector('.disclaimer');
        if (disclaimer) disclaimer.textContent = t('disclaimer');
    }

    function getComponentBasePath() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        const depth = Math.max(0, segments.length - 1);
        return '../'.repeat(depth);
    }

    function ensureCSSLoaded() {
        if (document.querySelector('link[href*="atomos-calculator.css"]')) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = getComponentBasePath() + 'css/atomos-calculator.css';
        document.head.appendChild(link);
    }

    async function loadComponentHTML() {
        const url = getComponentBasePath() + 'components/atomos-price-comparator.html';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load calculator component');
        return response.text();
    }

    function initCalculator(container) {
        const $ = (id) => container.querySelector('#' + id);

        function getInputs() {
            const hosts = parseInt($('atomos-calc-hosts')?.value, 10) || 1;
            const coresPerHost = parseInt($('atomos-calc-cores')?.value, 10) || 16;
            const vms = parseInt($('atomos-calc-vms')?.value, 10) || 1;
            const years = parseInt($('atomos-calc-subscription')?.value, 10) || 3;
            const storageTB = parseInt($('atomos-calc-storage')?.value, 10) || 12;
            const comparison = $('atomos-calc-comparison')?.value || 'vsphere-foundation';
            const atomosSupport = $('atomos-calc-support-tier')?.value || 'base';
            const effectiveCoresPerHost = Math.max(16, coresPerHost);
            const totalCores = hosts * effectiveCoresPerHost;
            return { hosts, coresPerHost, vms, years, storageTB, comparison, atomosSupport, totalCores };
        }

        function getMultiYearDiscount(years) {
            if (years >= 5) return 0.20;
            if (years >= 3) return 0.15;
            return 0;
        }

        function getCompetitorCosts(comparison, hosts, totalCores, storageTB, years) {
            const discount = getMultiYearDiscount(years);
            const mult = 1 - discount;

            switch (comparison) {
                case 'vsphere-foundation':
                case 'cloud-foundation': {
                    const perCore = comparison === 'cloud-foundation' ? CONFIG.vmwareCloudFoundationPerCoreYear : CONFIG.vmwareVSphereFoundationPerCoreYear;
                    const hypervisor = Math.round(totalCores * perCore * years * mult);
                    const storage = Math.round(storageTB * CONFIG.vmwareVSANPerTBYear * years * mult);
                    const support = Math.round((hypervisor + storage) * (CONFIG.vmwareSupportPercent / 100));
                    return { hypervisor, storage, support, total: hypervisor + storage + support, storageLabel: t('storageVsan') };
                }
                case 'nutanix': {
                    const total = Math.round(hosts * CONFIG.nutanixPerNodeYear * years * mult);
                    return { hypervisor: total, storage: 0, support: 0, total, storageLabel: t('storage') };
                }
                case 'sangfor': {
                    const total = Math.round(hosts * CONFIG.sangforPerNodeYear * years * mult);
                    return { hypervisor: total, storage: 0, support: 0, total, storageLabel: t('storage') };
                }
                case 'hyperv': {
                    const hypervisor = Math.round(totalCores * CONFIG.hypervPerCoreYear * years * mult);
                    return { hypervisor, storage: 0, support: 0, total: hypervisor, storageLabel: t('storage') };
                }
                default:
                    return { hypervisor: 0, storage: 0, support: 0, total: 0, storageLabel: t('storage') };
            }
        }

        function calculate() {
            const { hosts, vms, years, storageTB, comparison, atomosSupport, totalCores } = getInputs();
            const comp = getCompetitorCosts(comparison, hosts, totalCores, storageTB, years);

            const atomosLicense = hosts * CONFIG.atomosPerHostYear * years;
            const supportPerHost = atomosSupport === 'pro' ? CONFIG.atomosSupportPro : CONFIG.atomosSupportBase;
            const atomosSupportCost = hosts * supportPerHost * years;
            const atomosTotal = atomosLicense + atomosSupportCost;

            const savings = comp.total - atomosTotal;
            const savingsPercent = comp.total > 0 ? Math.round((savings / comp.total) * 100) : 0;
            const costPerVMYear = vms > 0 ? Math.round(comp.total / years / vms) : 0;
            const costPerHostYear = hosts > 0 ? Math.round(comp.total / years / hosts) : 0;

            const fmt = formatMoney;

            const setText = (el, text) => { if (el) el.textContent = text; };
            const setStyle = (el, prop, val) => { if (el) el.style[prop] = val; };

            const compLabel = comparisonLabels[comparison];
            const compShort = comparisonShortLabels[comparison] || compLabel;
            setText($('atomos-calc-vmware-table-label'), compLabel);
            setText($('atomos-calc-chart-title'), t('chartTitle', { compLabel }));

            const pageTitle = document.querySelector('#atomos-page-title');
            const pageSubtitle = document.querySelector('#atomos-page-subtitle');
            if (pageTitle) pageTitle.textContent = t('pageTitle', { compShort });
            if (pageSubtitle) pageSubtitle.textContent = t('pageSubtitle', { compShort });
            document.title = t('pageTitle', { compShort }) + t('pageTitleSuffix');
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', t('metaDescription', { compShort }));
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.setAttribute('content', t('pageTitle', { compShort }) + t('pageTitleSuffix'));
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.setAttribute('content', t('metaDescriptionShort', { compShort }));
            const twTitle = document.querySelector('meta[name="twitter:title"]');
            if (twTitle) twTitle.setAttribute('content', t('pageTitle', { compShort }) + t('pageTitleSuffix'));
            const twDesc = document.querySelector('meta[name="twitter:description"]');
            if (twDesc) twDesc.setAttribute('content', t('pageSubtitle', { compShort }));
            setText($('atomos-calc-details-summary'), t('detailsSummary', { compLabel }));
            setText($('atomos-calc-details-intro'), t('detailsIntroDynamic', { compLabel }));
            setText($('atomos-calc-metric-label-vm'), t('costPerVmYear', { label: compLabel }));
            setText($('atomos-calc-metric-label-host'), t('costPerHostYear', { label: compLabel }));
            setText($('atomos-calc-vmware-hypervisor'), fmt(comp.hypervisor));
            setText($('atomos-calc-vmware-storage'), comp.storage > 0 ? fmt(comp.storage) : t('included'));
            setText($('atomos-calc-vmware-support'), comp.support > 0 ? fmt(comp.support) : t('included'));
            setText($('atomos-calc-vmware-total'), fmt(comp.total));

            setText($('atomos-calc-atomos-hypervisor'), fmt(atomosLicense));
            setText($('atomos-calc-atomos-storage'), t('included'));
            setText($('atomos-calc-atomos-support-cost'), fmt(atomosSupportCost));
            setText($('atomos-calc-atomos-total'), fmt(atomosTotal));

            setText($('atomos-calc-vmware-label'), t('competitorTotal', { label: comparisonLabels[comparison] }));
            setText($('atomos-calc-vmware-cost'), fmt(comp.total));
            const detailSuffix = (comparison === 'nutanix' || comparison === 'sangfor') ? t('nodes') : t('cores');
            setText($('atomos-calc-vmware-detail'), t('overPeriod', {
                period: periodLabel(years),
                count: totalCores,
                unit: detailSuffix,
            }));

            const tierName = atomosSupport === 'pro' ? t('supportPro') : t('supportBase');
            setText($('atomos-calc-atomos-cost'), fmt(atomosTotal));
            setText($('atomos-calc-atomos-detail'), t('supportDetail', {
                tier: tierName,
                hosts,
                hostLabel: hostsLabel(hosts),
            }));

            setText($('atomos-calc-metric-savings-pct'), `${savingsPercent}%`);
            setText($('atomos-calc-metric-cost-per-vm'), fmt(costPerVMYear));
            setText($('atomos-calc-metric-cost-per-host'), fmt(costPerHostYear));

            const maxCost = Math.max(comp.total, atomosTotal, 1);
            const compPct = maxCost > 0 ? (comp.total / maxCost) * 100 : 0;
            const atomosPct = maxCost > 0 ? (atomosTotal / maxCost) * 100 : 0;
            setText($('atomos-calc-chart-vmware-label'), comparisonLabels[comparison]);
            setStyle($('atomos-calc-chart-vmware-fill'), 'width', compPct + '%');
            setStyle($('atomos-calc-chart-atomos-fill'), 'width', atomosPct + '%');
            setText($('atomos-calc-chart-vmware-value'), fmt(comp.total));
            setText($('atomos-calc-chart-atomos-value'), fmt(atomosTotal));
            setText($('atomos-calc-chart-legend-vmware'), comparisonLabels[comparison]);

            if (savings >= 0) {
                setText($('atomos-calc-savings-percent'), t('saveUpTo', { pct: savingsPercent }));
                setText($('atomos-calc-savings-amount'), t('savingsOver', { amount: fmt(savings), period: periodLabel(years) }));
                setText($('atomos-calc-savings-sub'), t('savingsWithAtomos', { compLabel: comparisonLabels[comparison] }));
            } else {
                setText($('atomos-calc-savings-percent'), t('competitorCostsLess', { compLabel: comparisonLabels[comparison], pct: Math.abs(savingsPercent) }));
                setText($('atomos-calc-savings-amount'), t('competitorSavingsOver', {
                    amount: fmt(Math.abs(savings)),
                    compLabel: comparisonLabels[comparison],
                    period: periodLabel(years),
                }));
                setText($('atomos-calc-savings-sub'), t('atomosExceeds', { compLabel: comparisonLabels[comparison] }));
            }

            updateSliderAvailability();
        }

        function updateSliderAvailability() {
            const comparison = $('atomos-calc-comparison')?.value || 'vsphere-foundation';
            const storageEnabled = comparisonsWithStoragePricing.includes(comparison);
            const coresEnabled = comparisonsWithCoresPricing.includes(comparison);
            const storageSlider = $('atomos-calc-storage-slider');
            const storageInput = $('atomos-calc-storage');
            const coresSlider = $('atomos-calc-cores-slider');
            const coresInput = $('atomos-calc-cores');
            const storageWrap = container.querySelector('#atomos-calc-storage-wrap');
            const coresGroup = container.querySelector('#atomos-calc-cores-wrap');
            const storageHint = $('atomos-calc-storage-hint');
            const coresHint = $('atomos-calc-cores-hint');
            [storageSlider, storageInput].forEach(el => { if (el) el.disabled = !storageEnabled; });
            [coresSlider, coresInput].forEach(el => { if (el) el.disabled = !coresEnabled; });
            if (storageWrap) storageWrap.classList.toggle('atomos-input-disabled', !storageEnabled);
            if (coresGroup) coresGroup.classList.toggle('atomos-input-disabled', !coresEnabled);
            if (storageHint) storageHint.setAttribute('aria-hidden', storageEnabled);
            if (coresHint) coresHint.setAttribute('aria-hidden', coresEnabled);
        }

        function updateSliderFill(s) {
            if (!s) return;
            const min = parseInt(s.min, 10) || 0;
            const max = parseInt(s.max, 10) || 100;
            const val = parseInt(s.value, 10) || min;
            const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
            s.style.setProperty('--slider-fill-percent', String(pct));
        }

        const sliderInputPairs = [
            { slider: 'atomos-calc-hosts-slider', input: 'atomos-calc-hosts', min: 1, max: 500 },
            { slider: 'atomos-calc-cores-slider', input: 'atomos-calc-cores', min: 8, max: 256 },
            { slider: 'atomos-calc-vms-slider', input: 'atomos-calc-vms', min: 1, max: 10000 },
            { slider: 'atomos-calc-storage-slider', input: 'atomos-calc-storage', min: 2, max: 48 }
        ];

        sliderInputPairs.forEach(({ slider, input, min, max }) => {
            const s = $(slider);
            const i = $(input);
            if (!s || !i) return;
            const sliderMax = parseInt(s.max, 10);
            updateSliderFill(s);
            s.addEventListener('input', () => {
                i.value = s.value;
                updateSliderFill(s);
                calculate();
            });
            function syncFromInput() {
                let v = parseInt(i.value, 10);
                if (isNaN(v)) v = min;
                v = Math.max(min, Math.min(max, v));
                i.value = v;
                s.value = Math.min(v, sliderMax);
                updateSliderFill(s);
                calculate();
            }
            i.addEventListener('input', syncFromInput);
            i.addEventListener('change', syncFromInput);
        });

        ['atomos-calc-subscription', 'atomos-calc-comparison'].forEach(id => {
            const el = $(id);
            if (el) el.addEventListener('change', calculate);
        });

        container.querySelectorAll('.support-level-card').forEach(card => {
            card.addEventListener('click', () => {
                const value = card.getAttribute('data-value');
                const hidden = $('atomos-calc-support-tier');
                if (hidden && value) {
                    hidden.value = value;
                    container.querySelectorAll('.support-level-card').forEach(c => {
                        const isSelected = c.getAttribute('data-value') === value;
                        c.classList.toggle('selected', isSelected);
                        c.setAttribute('aria-pressed', isSelected);
                    });
                    calculate();
                }
            });
        });

        const pdfBtn = $('atomos-calc-download-pdf');
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => {
                const inputs = getInputs();
                const comp = getCompetitorCosts(inputs.comparison, inputs.hosts, inputs.totalCores, inputs.storageTB, inputs.years);
                const atomosLicense = inputs.hosts * CONFIG.atomosPerHostYear * inputs.years;
                const supportPerHost = inputs.atomosSupport === 'pro' ? CONFIG.atomosSupportPro : CONFIG.atomosSupportBase;
                const atomosSupportCost = inputs.hosts * supportPerHost * inputs.years;
                const atomosTotal = atomosLicense + atomosSupportCost;
                const savings = comp.total - atomosTotal;
                const savingsPercent = comp.total > 0 ? Math.round((savings / comp.total) * 100) : 0;
                const costPerVMYear = inputs.vms > 0 ? Math.round(comp.total / inputs.years / inputs.vms) : 0;
                const costPerHostYear = inputs.hosts > 0 ? Math.round(comp.total / inputs.years / inputs.hosts) : 0;
                const compLabel = comparisonLabels[inputs.comparison];
                const compShort = comparisonShortLabels[inputs.comparison] || compLabel;
                const detailSuffix = (inputs.comparison === 'nutanix' || inputs.comparison === 'sangfor') ? t('nodes') : t('cores');
                const compDetail = t('overPeriod', {
                    period: periodLabel(inputs.years),
                    count: inputs.totalCores,
                    unit: detailSuffix,
                });
                const tierName = inputs.atomosSupport === 'pro' ? t('supportPro') : t('supportBase');
                const atomosDetail = t('supportDetail', {
                    tier: tierName,
                    hosts: inputs.hosts,
                    hostLabel: hostsLabel(inputs.hosts),
                });
                const fmt = formatMoney;
                const data = {
                    title: t('pdfReportTitle', { compLabel }),
                    compLabel,
                    compShort,
                    config: { hosts: inputs.hosts, cores: inputs.coresPerHost, vms: inputs.vms, storageTB: inputs.storageTB, years: inputs.years, support: inputs.atomosSupport, hasStorage: comparisonsWithStoragePricing.includes(inputs.comparison) },
                    comp: { hypervisor: comp.hypervisor, storage: comp.storage, support: comp.support, total: comp.total, detail: compDetail },
                    atomos: { license: atomosLicense, support: atomosSupportCost, total: atomosTotal, detail: atomosDetail },
                    savings: { amount: savings, percent: savingsPercent },
                    metrics: { costPerVMYear, costPerHostYear },
                    fmt
                };
                exportToPdf(data);
            });
        }

        calculate();
    }

    function exportToPdf(data) {
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF not loaded');
            alert(t('pdfUnavailable'));
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageW = doc.internal.pageSize.getWidth();
        let y = 18;
        const dateLocale = getLocale() === 'it' ? 'it-IT' : 'en-GB';
        const tierName = data.config.support === 'pro' ? t('supportPro') : t('supportBase');

        doc.setFontSize(11);
        doc.setTextColor(255, 166, 0);
        doc.setFont(undefined, 'bold');
        doc.text('Elemento', 14, y);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('elemento.cloud', pageW - 14, y, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        y += 4;
        doc.setDrawColor(255, 166, 0);
        doc.setLineWidth(0.5);
        doc.line(14, y, pageW - 14, y);
        y += 12;

        doc.setFontSize(18);
        doc.text(t('pdfTitle'), pageW / 2, y, { align: 'center' });
        y += 10;

        doc.setFontSize(14);
        doc.text(data.title, pageW / 2, y, { align: 'center' });
        y += 8;

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(t('pdfGenerated', {
            date: new Date().toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' }),
        }), pageW / 2, y, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        y += 14;

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(t('pdfConfiguration'), 14, y);
        doc.setFont(undefined, 'normal');
        y += 6;
        doc.text(t('pdfConfigLine', {
            hosts: data.config.hosts,
            cores: data.config.cores,
            vms: data.config.vms,
            years: data.config.years,
        }), 14, y);
        y += 5;
        if (data.config.hasStorage) {
            doc.text(t('pdfConfigStorage', { storage: data.config.storageTB, tier: tierName }), 14, y);
        } else {
            doc.text(t('pdfConfigSupport', { tier: tierName }), 14, y);
        }
        y += 12;

        doc.setFont(undefined, 'bold');
        doc.text(t('pdfCostBreakdown'), 14, y);
        doc.setFont(undefined, 'normal');
        y += 6;
        const col1 = 14;
        const col2 = 95;
        const col3 = 155;
        doc.text(t('pdfComponent'), col1, y);
        doc.text(data.compShort, col2, y);
        doc.text('Elemento AtomOS', col3, y);
        y += 6;
        doc.text(t('hypervisorLicensing'), col1, y);
        doc.text(data.comp.hypervisor > 0 ? data.fmt(data.comp.hypervisor) : t('included'), col2, y);
        doc.text(data.fmt(data.atomos.license), col3, y);
        y += 5;
        doc.text(t('storageVsan'), col1, y);
        doc.text(data.comp.storage > 0 ? data.fmt(data.comp.storage) : t('included'), col2, y);
        doc.text(t('included'), col3, y);
        y += 5;
        doc.text(t('managementSupport'), col1, y);
        doc.text(data.comp.support > 0 ? data.fmt(data.comp.support) : t('included'), col2, y);
        doc.text(data.fmt(data.atomos.support), col3, y);
        y += 6;
        doc.setFont(undefined, 'bold');
        doc.text(t('totalCost'), col1, y);
        doc.text(data.fmt(data.comp.total), col2, y);
        doc.text(data.fmt(data.atomos.total), col3, y);
        doc.setFont(undefined, 'normal');
        y += 12;

        doc.setFont(undefined, 'bold');
        doc.text(t('pdfSavings'), 14, y);
        doc.setFont(undefined, 'normal');
        y += 6;
        doc.text(t('pdfSaveLine', {
            amount: data.fmt(data.savings.amount),
            pct: data.savings.percent,
            period: periodLabel(data.config.years),
        }), 14, y);
        y += 12;

        doc.setFont(undefined, 'bold');
        doc.text(t('detailsIntro'), 14, y);
        y += 8;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(t('pdfSupportLevel'), 14, y);
        doc.setFont(undefined, 'normal');
        y += 6;
        const supportPrice = data.config.support === 'pro' ? '€2,000' : '€1,200';
        doc.text(t('pdfSupportSelected', { tier: tierName, price: supportPrice }), 14, y);
        y += 10;

        doc.setFont(undefined, 'bold');
        doc.text(t('pdfResultSummary'), 14, y);
        doc.setFont(undefined, 'normal');
        y += 6;
        doc.text(`${data.compShort} total: ${data.fmt(data.comp.total)} — ${data.comp.detail}`, 14, y);
        y += 5;
        doc.text(`Elemento AtomOS total: ${data.fmt(data.atomos.total)} — ${data.atomos.detail}`, 14, y);
        y += 10;

        doc.setFont(undefined, 'bold');
        doc.text(t('pdfMetrics'), 14, y);
        doc.setFont(undefined, 'normal');
        y += 6;
        doc.text(t('pdfMetricsLine', {
            pct: data.savings.percent,
            compShort: data.compShort,
            costVm: data.fmt(data.metrics.costPerVMYear),
            costHost: data.fmt(data.metrics.costPerHostYear),
        }), 14, y);
        y += 14;

        const pageH = doc.internal.pageSize.getHeight();
        if (y > pageH - 40) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(t('pdfFooter'), 14, y, { maxWidth: pageW - 28 });
        doc.setTextColor(0, 0, 0);

        const filename = `Elemento-AtomOS-vs-${data.compLabel.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(filename);
    }

    async function init() {
        const placeholders = document.querySelectorAll('[data-atomos-calculator]');
        if (!placeholders.length) return;

        ensureCSSLoaded();

        try {
            const html = await loadComponentHTML();
            const first = placeholders[0];
            first.innerHTML = html;
            first.removeAttribute('data-atomos-calculator');
            const container = first.querySelector('.atomos-calculator-container') || first;
            localizeComponent(container);
            initCalculator(container);
        } catch (err) {
            console.error('AtomOS calculator failed to load:', err);
            placeholders.forEach(p => {
                p.innerHTML = `<p class="component-error">${t('loadError')}</p>`;
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
