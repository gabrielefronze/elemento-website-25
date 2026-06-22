#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = readFileSync(join(ROOT, 'solutions/vmware-alternative.html'), 'utf-8');

const PRODUCTS = {
  electros: { logo: '../assets/logos/Electros.svg', name: 'Electros', link: '../electros.html' },
  atomosphere: { logo: '../assets/logos/Atomosphere.svg', name: 'Atomosphere', link: '../atomosphere.html' },
  atomosquare: { logo: '../assets/logos/Atomosquare.svg', name: 'Atomosquare', link: '../atomosquare.html' },
  atomos: { logo: '../assets/logos/Atomos.svg', name: 'AtomOS', link: '../atomos.html' },
};

function solutionItems(desc) {
  return [
    { logo: PRODUCTS.electros.logo, name: PRODUCTS.electros.name, description: desc.electros },
    { logo: PRODUCTS.atomosphere.logo, name: PRODUCTS.atomosphere.name, description: desc.atomosphere },
    { logo: PRODUCTS.atomosquare.logo, name: PRODUCTS.atomosquare.name, description: desc.atomosquare },
    { logo: PRODUCTS.atomos.logo, name: PRODUCTS.atomos.name, description: desc.atomos },
  ];
}

const SOLUTIONS = [
  {
    slug: 'vmware-exit',
    title: 'Exit VMware Without Entering Another Lock-In',
    shortTitle: 'VMware Exit',
    description: 'Govern VMware and AtomOS side by side. Migrate workload by workload with no forklift, no downtime windows, and no new dependency cycle.',
    keywords: 'vmware exit, vmware migration, hypervisor, vendor lock-in, atomos, electros, atomosquare, metacloud',
    icon: 'fas fa-door-open',
    tag: 'VMware Exit',
    secondaryCTA: { text: 'Explore Platform', link: '../platform.html', icon: 'fas fa-layer-group' },
    painPoints: [
      { icon: 'fas fa-sync-alt', title: 'Hypervisor Swap Only', description: 'Replacing VMware with another hypervisor addresses licensing but not the underlying dependency model.' },
      { icon: 'fas fa-truck-loading', title: 'Forklift Migration Risk', description: 'Big-bang migrations create downtime windows and operational risk across critical workloads.' },
      { icon: 'fas fa-lock', title: 'New Lock-In Cycle', description: 'Switching vendors without a governance layer simply restarts the dependency cycle elsewhere.' },
      { icon: 'fas fa-random', title: 'Fragmented Control', description: 'Running mixed hypervisors without a unified control plane multiplies operational overhead.' },
    ],
    useCase: [
      { number: '1', title: 'Assess', description: 'Inventory VMware estates and classify workloads by migration readiness and sovereignty requirements.' },
      { number: '2', title: 'Govern Side by Side', description: 'Connect VMware and AtomOS endpoints under Electros with Atomosquare bridging legacy environments.' },
      { number: '3', title: 'Migrate Incrementally', description: 'Move workloads one at a time with consistent policies, monitoring, and rollback paths.' },
      { number: '4', title: 'Decommission Safely', description: 'Retire VMware capacity as governance and operations fully shift to the Metacloud model.' },
    ],
    productDesc: {
      electros: 'Consistent control plane governing VMware, AtomOS, and third-party hypervisors from one console.',
      atomosphere: 'Broker cloud and sovereign provider capacity without binding workloads to a single vendor.',
      atomosquare: 'Operate legacy VMware, AtomOS, and third-party hypervisors under the same governance model.',
      atomos: 'Native sovereign execution engine for workloads ready to leave VMware behind.',
    },
    stats: [
      { label: 'Downtime Windows', value: 'Zero', icon: 'fas fa-clock', color: 'green' },
      { label: 'Migration Model', value: 'Incremental', icon: 'fas fa-shoe-prints', color: 'orange' },
      { label: 'Vendor Lock-In', value: 'Avoided', icon: 'fas fa-unlock', color: 'blue' },
    ],
    faq: [
      { question: 'Do we need a forklift migration from VMware?', answer: 'No. Elemento is designed for side-by-side operation. Govern VMware and AtomOS together, then migrate workload by workload at your own pace.' },
      { question: 'How does Atomosquare help during VMware exit?', answer: 'Atomosquare connects VMware and other third-party hypervisors to Electros so you apply the same policies, monitoring, and access controls across all environments.' },
      { question: 'What happens to existing VMware investments during transition?', answer: 'You keep running VMware where needed while gradually shifting execution to AtomOS. No forced rip-and-replace timeline.' },
      { question: 'How is this different from switching to another proprietary hypervisor?', answer: 'Electros provides an organisation-wide control plane that is not tied to a single hypervisor or cloud. You gain portability instead of trading one lock-in for another.' },
    ],
    ctaPrimary: 'Run a VMware Exit Assessment',
    solutionTitle: "Elemento's VMware Exit Path",
    solutionDesc: 'Govern mixed hypervisor estates and migrate incrementally without entering a new dependency cycle.',
    ctaLink: '../contact.html',
  },
  {
    slug: 'sovereign-cloud-governance',
    title: 'Sovereignty as a Workload Policy',
    shortTitle: 'Sovereign Cloud Governance',
    description: 'Apply jurisdiction, residency, and audit policies across clouds, hypervisors, and sovereign providers from one control plane.',
    keywords: 'sovereign cloud, data residency, workload policy, governance, compliance, electros, atomosphere, metacloud',
    icon: 'fas fa-shield-alt',
    tag: 'Sovereign Governance',
    secondaryCTA: { text: 'Read Sovereignty Guide', link: '../resources.html', icon: 'fas fa-book' },
    painPoints: [
      { icon: 'fas fa-globe-europe', title: 'Jurisdiction Complexity', description: 'Regulatory requirements differ by region, workload, and data classification across your estate.' },
      { icon: 'fas fa-database', title: 'Residency Blind Spots', description: 'Data can drift across providers without per-workload residency enforcement.' },
      { icon: 'fas fa-eye-slash', title: 'Audit Gaps', description: 'Fragmented tooling makes it hard to prove where workloads run and who accessed them.' },
      { icon: 'fas fa-code-branch', title: 'Policy Sprawl', description: 'Separate governance models per cloud and hypervisor multiply compliance overhead.' },
    ],
    useCase: [
      { number: '1', title: 'Define Policies', description: 'Set jurisdiction, residency, and audit requirements as workload-level policies in Electros.' },
      { number: '2', title: 'Map Providers', description: 'Connect sovereign, public, and private providers through Atomosphere and Atomosquare.' },
      { number: '3', title: 'Enforce Continuously', description: 'Apply policies across clouds and hypervisors with automated enforcement and visibility.' },
      { number: '4', title: 'Audit & Report', description: 'Maintain audit trails and compliance reporting from a single governance layer.' },
    ],
    productDesc: {
      electros: 'Organisation-wide control plane for sovereignty policies, audit visibility, and enforcement.',
      atomosphere: 'Cross-provider orchestration with residency-aware placement across sovereign and public Cloud.',
      atomosquare: 'Extend governance to VMware, OpenStack, Proxmox, and other hypervisor endpoints.',
      atomos: 'Sovereign execution engine for workloads that must run on infrastructure you control.',
    },
    stats: [
      { label: 'Policy Scope', value: 'Per-Workload', icon: 'fas fa-tasks', color: 'green' },
      { label: 'Provider Coverage', value: 'Cross-Cloud', icon: 'fas fa-cloud', color: 'orange' },
      { label: 'Audit Trail', value: 'Unified', icon: 'fas fa-clipboard-check', color: 'blue' },
    ],
    faq: [
      { question: 'Can sovereignty policies apply across different cloud providers?', answer: 'Yes. Electros defines policies at the workload level and enforces them across public Cloud, sovereign providers, and on-premises infrastructure via Atomosphere and Atomosquare.' },
      { question: 'How is data residency controlled?', answer: 'You set residency rules per workload. Placement and migration decisions respect those rules automatically across connected providers.' },
      { question: 'Does this replace our compliance tooling?', answer: 'Elemento provides governance, audit visibility, and policy enforcement across infrastructure. It complements GRC platforms by operating at the workload and provider layer.' },
      { question: 'Can we audit access across hybrid environments?', answer: 'Electros centralises operational visibility and audit trails across all connected endpoints, regardless of underlying provider or hypervisor.' },
    ],
    ctaPrimary: 'Assess Your Sovereignty Posture',
    solutionTitle: 'Sovereignty as Workload Policy',
    solutionDesc: 'One governance model for jurisdiction, residency, and audit across every Cloud and hypervisor.',
    ctaLink: '../contact.html',
  },
  {
    slug: 'hybrid-multi-cloud',
    title: 'One Operating Model for Hybrid Infrastructure',
    shortTitle: 'Hybrid & Multi-Cloud',
    description: 'Manage public Cloud, private infrastructure, hypervisors, and edge environments without separate toolchains.',
    keywords: 'hybrid cloud, multi-cloud, infrastructure operations, orchestration, electros, atomosphere, metacloud',
    icon: 'fas fa-cloud',
    tag: 'Hybrid Operations',
    secondaryCTA: { text: 'View Platform', link: '../platform.html', icon: 'fas fa-layer-group' },
    painPoints: [
      { icon: 'fas fa-toolbox', title: 'Separate Toolchains', description: 'Each environment brings its own console, APIs, and operational practices.' },
      { icon: 'fas fa-chart-pie', title: 'Cost Opacity', description: 'Spend and utilisation are scattered across providers with no unified view.' },
      { icon: 'fas fa-random', title: 'Orchestration Gaps', description: 'Cross-provider automation requires brittle custom integrations.' },
      { icon: 'fas fa-network-wired', title: 'Edge Fragmentation', description: 'Edge, on-premises, and Cloud resources operate as disconnected silos.' },
    ],
    useCase: [
      { number: '1', title: 'Connect Estates', description: 'Onboard public Cloud, private infrastructure, hypervisors, and edge into Electros.' },
      { number: '2', title: 'Abstract Resources', description: 'Use Atomosphere to normalise provider APIs behind a single operational model.' },
      { number: '3', title: 'Automate Operations', description: 'Deploy, scale, and govern workloads with consistent automation across environments.' },
      { number: '4', title: 'Optimise Continuously', description: 'Track cost, utilisation, and governance from one dashboard with remote access built in.' },
    ],
    productDesc: {
      electros: 'Unified dashboard for governance, cost visibility, automation, and remote access.',
      atomosphere: 'Cross-provider orchestration and resource abstraction across public and sovereign Cloud.',
      atomosquare: 'Integrate private hypervisors and legacy platforms into the same operating model.',
      atomos: 'Consistent execution layer for on-premises and edge workloads.',
    },
    stats: [
      { label: 'Consoles Replaced', value: 'Many → One', icon: 'fas fa-desktop', color: 'green' },
      { label: 'Environments', value: 'Unified', icon: 'fas fa-sitemap', color: 'orange' },
      { label: 'Automation', value: 'Cross-Provider', icon: 'fas fa-robot', color: 'blue' },
    ],
    faq: [
      { question: 'Do we still need provider-native consoles?', answer: 'For deep provider-specific tasks, yes. But day-to-day operations—deployment, monitoring, governance, and cost visibility—happen in Electros.' },
      { question: 'Which providers are supported?', answer: 'Atomosphere connects supported public and sovereign Cloud service classes. Atomosquare extends coverage to private hypervisors and on-premises infrastructure.' },
      { question: 'How does remote access work?', answer: 'Electros provides secure remote access to infrastructure across environments without VPN sprawl or per-provider jump hosts.' },
      { question: 'Can we automate across Cloud and on-premises?', answer: 'Yes. The same automation and policy model applies whether workloads run in public Cloud, private data centres, or at the edge.' },
    ],
    ctaPrimary: 'Map Your Infrastructure Estate',
    solutionTitle: 'One Operating Model',
    solutionDesc: 'Unified dashboard, orchestration, and governance for hybrid and multi-Cloud infrastructure.',
    ctaLink: '../contact.html',
  },
  {
    slug: 'ai-gpu-infrastructure',
    title: 'Govern AI Infrastructure Across Providers',
    shortTitle: 'AI & GPU Infrastructure',
    description: 'Provision, monitor, and govern GPU resources across local, private, and federated infrastructure using the same operational model as conventional infrastructure.',
    keywords: 'AI infrastructure, GPU orchestration, sovereign AI, private AI, federated GPU, electros, atomos, metacloud',
    icon: 'fas fa-microchip',
    tag: 'AI Infrastructure',
    secondaryCTA: { text: 'Explore Electros', link: '../electros.html', icon: 'fas fa-bolt' },
    painPoints: [
      { icon: 'fas fa-memory', title: 'GPU Silos', description: 'AI teams juggle separate tools for on-premises, Cloud, and federated GPU capacity.' },
      { icon: 'fas fa-balance-scale', title: 'Allocation Inefficiency', description: 'Expensive GPU resources sit idle while demand shifts between environments.' },
      { icon: 'fas fa-shield-alt', title: 'Sovereign AI Constraints', description: 'Regulated workloads cannot use public Cloud GPU without governance controls.' },
      { icon: 'fas fa-project-diagram', title: 'Operational Divergence', description: 'AI infrastructure runs on a different operational model than the rest of IT.' },
    ],
    useCase: [
      { number: '1', title: 'Inventory GPU Capacity', description: 'Discover and catalogue GPU resources across local, private, and federated providers.' },
      { number: '2', title: 'Allocate by Policy', description: 'Assign GPU resources with sovereignty, residency, and cost policies via Electros.' },
      { number: '3', title: 'Orchestrate Hybrid AI', description: 'Run training and inference across environments with Atomosphere and AtomOS GPU passthrough.' },
      { number: '4', title: 'Govern & Optimise', description: 'Monitor utilisation, enforce policies, and federate consumption without separate AI ops stacks.' },
    ],
    productDesc: {
      electros: 'Govern GPU allocation, monitoring, and policy across all AI infrastructure endpoints.',
      atomosphere: 'Federate GPU consumption across public, sovereign, and neocloud providers.',
      atomosquare: 'Connect third-party hypervisor environments hosting GPU workloads into one model.',
      atomos: 'Private AI infrastructure with GPU passthrough for sovereign and on-premises deployment.',
    },
    stats: [
      { label: 'GPU Governance', value: 'Unified', icon: 'fas fa-microchip', color: 'green' },
      { label: 'Deployment Model', value: 'Hybrid AI', icon: 'fas fa-brain', color: 'orange' },
      { label: 'Sovereign AI', value: 'Supported', icon: 'fas fa-shield-alt', color: 'blue' },
    ],
    faq: [
      { question: 'Can Electros manage GPUs the same way as conventional infrastructure?', answer: 'Yes. GPU resources are provisioned, monitored, and governed through the same Electros control plane as the rest of your infrastructure.' },
      { question: 'How does sovereign AI deployment work?', answer: 'AtomOS provides GPU passthrough on infrastructure you control. Electros applies residency and access policies so regulated AI workloads stay compliant.' },
      { question: 'Can we federate GPU consumption across providers?', answer: 'Atomosphere enables federated access to GPU capacity across connected providers while Electros maintains allocation and governance.' },
      { question: 'Do we need a separate MLOps platform?', answer: 'Elemento governs the infrastructure layer. It integrates with your existing ML tooling while providing unified GPU operations and policy enforcement.' },
    ],
    ctaPrimary: 'Plan an AI Infrastructure Strategy',
    solutionTitle: 'AI Infrastructure Governance',
    solutionDesc: 'Provision, monitor, and govern GPU resources across local, private, and federated infrastructure.',
    ctaLink: '../contact.html',
  },
  {
    slug: 'service-providers',
    title: 'Expand Your Cloud Portfolio Without Building Every Service',
    shortTitle: 'Service Providers',
    description: 'Use Elemento as your Metacloud control plane to broker third-party infrastructure and services under your own governance model.',
    keywords: 'service provider, white label, neocloud, metacloud, cloud portfolio, electros, atomosphere, federation',
    icon: 'fas fa-store',
    tag: 'White Label',
    secondaryCTA: { text: 'View Pricing', link: '../pricing.html', icon: 'fas fa-tags' },
    painPoints: [
      { icon: 'fas fa-hammer', title: 'Build Everything', description: 'Launching a Cloud offering means building portals, billing, governance, and integrations from scratch.' },
      { icon: 'fas fa-id-badge', title: 'Identity Fragmentation', description: 'Customers expect independent identity systems and operational boundaries.' },
      { icon: 'fas fa-link', title: 'Provider Integration Cost', description: 'Connecting to multiple upstream providers multiplies engineering and maintenance effort.' },
      { icon: 'fas fa-chart-line', title: 'Slow Time to Market', description: 'Building every service layer delays revenue from your Cloud portfolio.' },
    ],
    useCase: [
      { number: '1', title: 'Launch Portal', description: 'Deploy a dedicated customer portal with white-label Electros under your brand.' },
      { number: '2', title: 'Configure Governance', description: 'Set independent identity, operational control, and policy boundaries per tenant.' },
      { number: '3', title: 'Broker Providers', description: 'Federate upstream infrastructure through Atomosphere without building each integration.' },
      { number: '4', title: 'Scale Portfolio', description: 'Expand service classes and providers as your Metacloud offering grows.' },
    ],
    productDesc: {
      electros: 'White-label Metacloud control plane with dedicated governance and independent identity systems.',
      atomosphere: 'Federation layer to broker third-party infrastructure and Cloud service classes.',
      atomosquare: 'Onboard customer hypervisor estates and hybrid endpoints into your offering.',
      atomos: 'Sovereign execution engine for provider-hosted or customer-managed infrastructure.',
    },
    stats: [
      { label: 'Time to Market', value: 'Faster', icon: 'fas fa-rocket', color: 'green' },
      { label: 'Brand Control', value: 'White Label', icon: 'fas fa-palette', color: 'orange' },
      { label: 'Provider Federation', value: 'Built-In', icon: 'fas fa-network-wired', color: 'blue' },
    ],
    faq: [
      { question: 'Is Electros truly white-label for service providers?', answer: 'Yes. You operate under your brand with dedicated portals, governance boundaries, and independent identity systems for your customers.' },
      { question: 'Do we need to build integrations with every upstream provider?', answer: 'Atomosphere federates supported service classes so you broker capacity without building each provider integration individually.' },
      { question: 'Can customers bring their own infrastructure?', answer: 'Atomosquare connects customer hypervisor estates into your Metacloud offering while you retain governance and operational control.' },
      { question: 'How does billing work?', answer: 'Electros is licensed at the organisation level. Infrastructure consumption is billed separately and transparently—see our pricing page for the full model.' },
    ],
    ctaPrimary: 'Launch Your Metacloud Offering',
    solutionTitle: 'Your Metacloud Platform',
    solutionDesc: 'Broker third-party infrastructure and services under your brand with dedicated governance.',
    ctaLink: '../contact.html',
  },
  {
    slug: 'cross-provider-dr',
    title: 'Disaster Recovery Without Provider Dependency',
    shortTitle: 'Cross-Provider DR',
    description: 'Use one control plane to coordinate primary, DR, and fallback environments across providers.',
    keywords: 'disaster recovery, cross-provider DR, failover, RPO, RTO, business continuity, electros, metacloud',
    icon: 'fas fa-life-ring',
    tag: 'Disaster Recovery',
    secondaryCTA: { text: 'Explore Deployment', link: '../deployment.html', icon: 'fas fa-server' },
    painPoints: [
      { icon: 'fas fa-link', title: 'Provider-Locked DR', description: 'DR plans tied to a single Cloud vendor create recovery risk when that provider fails.' },
      { icon: 'fas fa-stopwatch', title: 'Inconsistent RPO/RTO', description: 'Different tools per environment make unified recovery objectives impossible to enforce.' },
      { icon: 'fas fa-map-marker-alt', title: 'Sovereign Recovery Gaps', description: 'Regulated workloads need recovery targets in specific jurisdictions, not just another region.' },
      { icon: 'fas fa-random', title: 'Complex Failover', description: 'Coordinating failover across providers requires manual runbooks and brittle automation.' },
    ],
    useCase: [
      { number: '1', title: 'Define Recovery Targets', description: 'Set unified RPO and RTO governance across primary and DR environments in Electros.' },
      { number: '2', title: 'Map DR Topology', description: 'Connect primary, DR, and on-premises fallback endpoints across providers.' },
      { number: '3', title: 'Orchestrate Failover', description: 'Coordinate cross-provider failover with consistent policies and visibility.' },
      { number: '4', title: 'Test & Validate', description: 'Run DR exercises across environments without provider-specific tooling.' },
    ],
    productDesc: {
      electros: 'Unified control plane for RPO/RTO governance and cross-provider DR coordination.',
      atomosphere: 'Orchestrate failover across public, sovereign, and federated Cloud providers.',
      atomosquare: 'Include on-premises and hypervisor-based fallback targets in DR topology.',
      atomos: 'Sovereign recovery execution engine for regulated and air-gapped fallback sites.',
    },
    stats: [
      { label: 'Failover Scope', value: 'Cross-Provider', icon: 'fas fa-exchange-alt', color: 'green' },
      { label: 'RPO/RTO', value: 'Unified', icon: 'fas fa-stopwatch', color: 'orange' },
      { label: 'Fallback Options', value: 'On-Prem + Cloud', icon: 'fas fa-server', color: 'blue' },
    ],
    faq: [
      { question: 'Can DR span multiple Cloud providers?', answer: 'Yes. Electros coordinates primary, DR, and fallback environments across providers with unified RPO and RTO governance.' },
      { question: 'How do sovereign recovery targets work?', answer: 'You define recovery policies per workload including jurisdiction and residency. Failover respects those constraints across connected providers.' },
      { question: 'Can on-premises be a DR target?', answer: 'Atomosquare and AtomOS enable on-premises fallback as part of your DR topology, not just another Cloud region.' },
      { question: 'Does this replace our backup solution?', answer: 'Elemento coordinates recovery orchestration and governance. It complements your backup and replication tooling by providing provider-independent failover control.' },
    ],
    ctaPrimary: 'Design Cross-Provider DR',
    solutionTitle: 'Provider-Independent DR',
    solutionDesc: 'Coordinate primary, DR, and fallback environments from one Metacloud control plane.',
    ctaLink: '../contact.html',
  },
  {
    slug: 'data-repatriation',
    title: 'Move Workloads When Sovereignty Changes',
    shortTitle: 'Data Repatriation',
    description: 'Make repatriation a policy decision instead of a re-engineering project.',
    keywords: 'data repatriation, workload migration, sovereignty, cloud exit, data residency, electros, metacloud',
    icon: 'fas fa-undo-alt',
    tag: 'Data Repatriation',
    secondaryCTA: { text: 'Sovereignty Resources', link: '../resources.html', icon: 'fas fa-book' },
    painPoints: [
      { icon: 'fas fa-globe-americas', title: 'Regulatory Shifts', description: 'Geopolitical and regulatory changes force workload relocation with little warning.' },
      { icon: 'fas fa-code', title: 'Re-Architecture Burden', description: 'Traditional repatriation requires application redesign and months of engineering.' },
      { icon: 'fas fa-eye-slash', title: 'Governance Loss', description: 'Moving workloads between providers often breaks audit trails and policy continuity.' },
      { icon: 'fas fa-random', title: 'US ↔ EU Complexity', description: 'Shifting workloads between US and EU providers involves incompatible operational models.' },
    ],
    useCase: [
      { number: '1', title: 'Assess Exposure', description: 'Identify workloads affected by sovereignty, residency, or geopolitical policy changes.' },
      { number: '2', title: 'Plan Repatriation', description: 'Define target environments and migration paths without application re-architecture.' },
      { number: '3', title: 'Migrate with Governance', description: 'Move workloads between US and EU providers or from public Cloud to on-premises while preserving policies.' },
      { number: '4', title: 'Validate Compliance', description: 'Confirm residency, audit, and operational continuity in the target environment.' },
    ],
    productDesc: {
      electros: 'Policy-driven repatriation with governance preserved throughout migration.',
      atomosphere: 'Move workloads between US, EU, and sovereign Cloud providers under one model.',
      atomosquare: 'Repatriate from public Cloud to on-premises hypervisor estates seamlessly.',
      atomos: 'Sovereign on-premises execution target for repatriated workloads.',
    },
    stats: [
      { label: 'Migration Driver', value: 'Policy', icon: 'fas fa-gavel', color: 'green' },
      { label: 'Re-Architecture', value: 'Avoided', icon: 'fas fa-code', color: 'orange' },
      { label: 'Governance', value: 'Preserved', icon: 'fas fa-shield-alt', color: 'blue' },
    ],
    faq: [
      { question: 'Can we repatriate without re-architecting applications?', answer: 'Yes. Elemento treats repatriation as a policy and placement decision. Workloads move between providers while governance and operational models stay consistent.' },
      { question: 'How do we move workloads from US to EU providers?', answer: 'Atomosphere orchestrates placement across regions and providers. Electros enforces residency and jurisdiction policies throughout the migration.' },
      { question: 'Can we move from public Cloud back to on-premises?', answer: 'Atomosquare and AtomOS provide the on-premises target. Migration preserves governance rather than requiring a new operational stack.' },
      { question: 'What triggers a repatriation plan?', answer: 'Regulatory changes, geopolitical shifts, cost optimisation, or internal sovereignty policies. Elemento lets you react with a plan instead of a re-engineering project.' },
    ],
    ctaPrimary: 'Build a Repatriation Plan',
    solutionTitle: 'Policy-Driven Repatriation',
    solutionDesc: 'Move workloads when sovereignty changes without re-engineering or losing governance.',
    ctaLink: '../contact.html',
  },
];

// Italian and French translations keyed by slug
const IT = {
  'vmware-exit': {
    title: 'Uscire da VMware senza un nuovo lock-in',
    shortTitle: 'Uscita da VMware',
    description: 'Gestisci VMware e AtomOS fianco a fianco. Migra workload per workload senza forklift, senza finestre di downtime e senza un nuovo ciclo di dipendenza.',
    tag: 'Uscita da VMware',
    secondaryCTA: { text: 'Esplora la piattaforma', link: '../platform.html', icon: 'fas fa-layer-group' },
    painTitles: ['Solo cambio hypervisor', 'Rischio migrazione forklift', 'Nuovo ciclo di lock-in', 'Controllo frammentato'],
    painDescs: ['Sostituire VMware con un altro hypervisor risolve le licenze ma non il modello di dipendenza sottostante.', 'Le migrazioni big-bang creano finestre di downtime e rischio operativo sui workload critici.', 'Cambiare vendor senza un layer di governance riavvia semplicemente il ciclo di dipendenza altrove.', 'Eseguire hypervisor misti senza un control plane unificato moltiplica il carico operativo.'],
    useTitles: ['Valutazione', 'Governance fianco a fianco', 'Migrazione incrementale', 'Decommissioning sicuro'],
    useDescs: ['Inventaria gli ambienti VMware e classifica i workload per readiness e requisiti di sovranità.', 'Collega endpoint VMware e AtomOS in Electros con Atomosquare come ponte per gli ambienti legacy.', 'Sposta i workload uno alla volta con policy, monitoraggio e percorsi di rollback coerenti.', 'Ritira la capacità VMware man mano che governance e operazioni passano al modello Metacloud.'],
    productDesc: { electros: 'Control plane coerente che governa VMware, AtomOS e hypervisor di terze parti da un\'unica console.', atomosphere: 'Intermedia capacità Cloud e provider sovrani senza legare i workload a un singolo vendor.', atomosquare: 'Opera VMware legacy, AtomOS e hypervisor di terze parti sotto lo stesso modello di governance.', atomos: 'Motore di esecuzione sovrano nativo per i workload pronti a lasciare VMware.' },
    statsLabels: ['Finestre di downtime', 'Modello di migrazione', 'Vendor lock-in'],
    statsValues: ['Zero', 'Incrementale', 'Evitato'],
    faqQ: ['Serve una migrazione forklift da VMware?', 'Come aiuta Atomosquare durante l\'uscita da VMware?', 'Cosa succede agli investimenti VMware esistenti?', 'In cosa differisce dal passare a un altro hypervisor proprietario?'],
    faqA: ['No. Elemento è progettato per l\'operatività fianco a fianco. Gestisci VMware e AtomOS insieme, poi migra workload per workload al tuo ritmo.', 'Atomosquare collega VMware e altri hypervisor di terze parti a Electros per applicare le stesse policy, monitoraggio e controlli di accesso.', 'Continui a usare VMware dove serve mentre sposti gradualmente l\'esecuzione su AtomOS. Nessuna timeline di rip-and-replace forzata.', 'Electros fornisce un control plane a livello di organizzazione non legato a un singolo hypervisor o Cloud. Ottieni portabilità invece di scambiare un lock-in con un altro.'],
    ctaPrimary: 'Avvia una valutazione di uscita da VMware',
    solutionTitle: 'Il percorso di uscita da VMware di Elemento',
    solutionDesc: 'Gestisci ambienti multi-hypervisor e migra in modo incrementale senza entrare in un nuovo ciclo di dipendenza.',
  },
  'sovereign-cloud-governance': {
    title: 'Sovranità come policy di workload',
    shortTitle: 'Governance Cloud sovrano',
    description: 'Applica policy di giurisdizione, residenza e audit su Cloud, hypervisor e provider sovrani da un unico control plane.',
    tag: 'Governance sovrana',
    secondaryCTA: { text: 'Guida alla sovranità', link: '../resources.html', icon: 'fas fa-book' },
    painTitles: ['Complessità giurisdizionale', 'Punti ciechi sulla residenza', 'Lacune di audit', 'Proliferazione delle policy'],
    painDescs: ['I requisiti normativi differiscono per regione, workload e classificazione dei dati.', 'I dati possono migrare tra provider senza enforcement della residenza per workload.', 'Strumenti frammentati rendono difficile dimostrare dove girano i workload e chi vi ha accesso.', 'Modelli di governance separati per Cloud e hypervisor moltiplicano il carico di compliance.'],
    useTitles: ['Definisci le policy', 'Mappa i provider', 'Applica in continuo', 'Audita e riporta'],
    useDescs: ['Imposta requisiti di giurisdizione, residenza e audit come policy a livello di workload in Electros.', 'Collega provider sovrani, pubblici e privati tramite Atomosphere e Atomosquare.', 'Applica policy su Cloud e hypervisor con enforcement automatizzato e visibilità.', 'Mantieni audit trail e reporting di compliance da un unico layer di governance.'],
    productDesc: { electros: 'Control plane a livello di organizzazione per policy di sovranità, visibilità audit e enforcement.', atomosphere: 'Orchestrazione cross-provider con placement consapevole della residenza su Cloud sovrani e pubblici.', atomosquare: 'Estendi la governance a VMware, OpenStack, Proxmox e altri endpoint hypervisor.', atomos: 'Motore di esecuzione sovrano per workload che devono girare su infrastruttura sotto il tuo controllo.' },
    statsLabels: ['Ambito policy', 'Copertura provider', 'Audit trail'],
    statsValues: ['Per workload', 'Cross-Cloud', 'Unificato'],
    faqQ: ['Le policy di sovranità si applicano su provider Cloud diversi?', 'Come si controlla la residenza dei dati?', 'Sostituisce i nostri strumenti di compliance?', 'Possiamo auditare l\'accesso in ambienti ibridi?'],
    faqA: ['Sì. Electros definisce policy a livello di workload e le applica su Cloud pubblico, provider sovrani e infrastruttura on-premises.', 'Imposti regole di residenza per workload. Le decisioni di placement e migrazione le rispettano automaticamente.', 'Elemento fornisce governance, visibilità audit e enforcement a livello infrastrutturale. Complementa le piattaforme GRC.', 'Electros centralizza visibilità operativa e audit trail su tutti gli endpoint collegati, indipendentemente dal provider.'],
    ctaPrimary: 'Valuta il tuo stato di sovranità',
    solutionTitle: 'Sovranità come policy di workload',
    solutionDesc: 'Un modello di governance per giurisdizione, residenza e audit su ogni Cloud e hypervisor.',
  },
  'hybrid-multi-cloud': {
    title: 'Un modello operativo per l\'infrastruttura ibrida',
    shortTitle: 'Ibrido e multi-Cloud',
    description: 'Gestisci Cloud pubblico, infrastruttura privata, hypervisor e edge senza toolchain separate.',
    tag: 'Operazioni ibride',
    secondaryCTA: { text: 'Vedi la piattaforma', link: '../platform.html', icon: 'fas fa-layer-group' },
    painTitles: ['Toolchain separate', 'Opacità dei costi', 'Lacune di orchestrazione', 'Frammentazione edge'],
    painDescs: ['Ogni ambiente porta la propria console, API e pratiche operative.', 'Spesa e utilizzo sono dispersi tra provider senza una vista unificata.', 'L\'automazione cross-provider richiede integrazioni custom fragili.', 'Risorse edge, on-premises e Cloud operano come silos disconnessi.'],
    useTitles: ['Collega gli ambienti', 'Astrai le risorse', 'Automatizza le operazioni', 'Ottimizza in continuo'],
    useDescs: ['Onboarda Cloud pubblico, infrastruttura privata, hypervisor e edge in Electros.', 'Usa Atomosphere per normalizzare le API dei provider dietro un unico modello operativo.', 'Distribuisci, scala e governa i workload con automazione coerente tra ambienti.', 'Monitora costi, utilizzo e governance da un\'unica dashboard con accesso remoto integrato.'],
    productDesc: { electros: 'Dashboard unificata per governance, visibilità dei costi, automazione e accesso remoto.', atomosphere: 'Orchestrazione cross-provider e astrazione delle risorse su Cloud pubblici e sovrani.', atomosquare: 'Integra hypervisor privati e piattaforme legacy nello stesso modello operativo.', atomos: 'Layer di esecuzione coerente per workload on-premises e edge.' },
    statsLabels: ['Console sostituite', 'Ambienti', 'Automazione'],
    statsValues: ['Molte → Una', 'Unificati', 'Cross-provider'],
    faqQ: ['Servono ancora le console native dei provider?', 'Quali provider sono supportati?', 'Come funziona l\'accesso remoto?', 'Possiamo automatizzare tra Cloud e on-premises?'],
    faqA: ['Per task specifici del provider, sì. Ma le operazioni quotidiane avvengono in Electros.', 'Atomosphere collega le classi di servizio Cloud supportate. Atomosquare estende la copertura agli hypervisor privati.', 'Electros fornisce accesso remoto sicuro senza proliferazione di VPN o jump host per provider.', 'Sì. Lo stesso modello di automazione e policy si applica in Cloud pubblico, data center privati o edge.'],
    ctaPrimary: 'Mappa il tuo patrimonio infrastrutturale',
    solutionTitle: 'Un modello operativo',
    solutionDesc: 'Dashboard, orchestrazione e governance unificate per infrastruttura ibrida e multi-Cloud.',
  },
  'ai-gpu-infrastructure': {
    title: 'Governare l\'infrastruttura AI tra i provider',
    shortTitle: 'Infrastruttura AI e GPU',
    description: 'Provisiona, monitora e governa risorse GPU su infrastruttura locale, privata e federata con lo stesso modello operativo dell\'infrastruttura convenzionale.',
    tag: 'Infrastruttura AI',
    secondaryCTA: { text: 'Esplora Electros', link: '../electros.html', icon: 'fas fa-bolt' },
    painTitles: ['Silos GPU', 'Inefficienza di allocazione', 'Vincoli AI sovrana', 'Divergenza operativa'],
    painDescs: ['I team AI gestiscono strumenti separati per GPU on-premises, Cloud e federate.', 'Risorse GPU costose restano inattive mentre la domanda si sposta tra ambienti.', 'Workload regolamentati non possono usare GPU Cloud pubblico senza controlli di governance.', 'L\'infrastruttura AI gira su un modello operativo diverso dal resto dell\'IT.'],
    useTitles: ['Inventaria capacità GPU', 'Alloca per policy', 'Orchestra AI ibrida', 'Governare e ottimizzare'],
    useDescs: ['Scopri e cataloga risorse GPU su provider locali, privati e federati.', 'Assegna risorse GPU con policy di sovranità, residenza e costo via Electros.', 'Esegui training e inferenza tra ambienti con Atomosphere e GPU passthrough su AtomOS.', 'Monitora utilizzo, applica policy e federazione del consumo senza stack AI ops separati.'],
    productDesc: { electros: 'Governare allocazione, monitoraggio e policy GPU su tutti gli endpoint infrastruttura AI.', atomosphere: 'Federare il consumo GPU su provider Cloud pubblici, sovrani e neocloud.', atomosquare: 'Collega ambienti hypervisor di terze parti con workload GPU in un unico modello.', atomos: 'Infrastruttura AI privata con GPU passthrough per deployment sovrano e on-premises.' },
    statsLabels: ['Governance GPU', 'Modello di deployment', 'AI sovrana'],
    statsValues: ['Unificata', 'AI ibrida', 'Supportata'],
    faqQ: ['Electros gestisce le GPU come l\'infrastruttura convenzionale?', 'Come funziona il deployment AI sovrano?', 'Possiamo federare il consumo GPU tra provider?', 'Serve una piattaforma MLOps separata?'],
    faqA: ['Sì. Le risorse GPU sono provisionate, monitorate e governate tramite lo stesso control plane Electros.', 'AtomOS fornisce GPU passthrough su infrastruttura sotto il tuo controllo. Electros applica policy di residenza e accesso.', 'Atomosphere abilita accesso federato alla capacità GPU mantenendo allocazione e governance in Electros.', 'Elemento governa il layer infrastrutturale e si integra con i tuoi strumenti ML esistenti.'],
    ctaPrimary: 'Pianifica una strategia infrastruttura AI',
    solutionTitle: 'Governance infrastruttura AI',
    solutionDesc: 'Provisiona, monitora e governa risorse GPU su infrastruttura locale, privata e federata.',
  },
  'service-providers': {
    title: 'Espandi il tuo portfolio Cloud senza costruire ogni servizio',
    shortTitle: 'Service Provider',
    description: 'Usa Elemento come control plane Metacloud per intermediare infrastruttura e servizi di terze parti sotto il tuo modello di governance.',
    tag: 'White label',
    secondaryCTA: { text: 'Vedi i prezzi', link: '../pricing.html', icon: 'fas fa-tags' },
    painTitles: ['Costruire tutto', 'Frammentazione identità', 'Costo integrazione provider', 'Lento time to market'],
    painDescs: ['Lanciare un\'offerta Cloud significa costruire portali, billing, governance e integrazioni da zero.', 'I clienti si aspettano sistemi di identità e confini operativi indipendenti.', 'Collegarsi a più provider upstream moltiplica sforzo ingegneristico e manutenzione.', 'Costruire ogni layer di servizio ritarda i ricavi dal portfolio Cloud.'],
    useTitles: ['Lancia il portale', 'Configura la governance', 'Intermedia i provider', 'Scala il portfolio'],
    useDescs: ['Distribuisci un portale clienti dedicato con Electros white-label sotto il tuo brand.', 'Imposta identità, controllo operativo e confini di policy indipendenti per tenant.', 'Federare infrastruttura upstream tramite Atomosphere senza costruire ogni integrazione.', 'Espandi classi di servizio e provider man mano che cresce la tua offerta Metacloud.'],
    productDesc: { electros: 'Control plane Metacloud white-label con governance dedicata e sistemi di identità indipendenti.', atomosphere: 'Layer di federazione per intermediare infrastruttura e classi di servizio Cloud di terze parti.', atomosquare: 'Onboarda patrimoni hypervisor clienti e endpoint ibridi nella tua offerta.', atomos: 'Motore di esecuzione sovrano per infrastruttura hostata dal provider o gestita dal cliente.' },
    statsLabels: ['Time to market', 'Controllo brand', 'Federazione provider'],
    statsValues: ['Più rapido', 'White label', 'Integrata'],
    faqQ: ['Electros è davvero white-label per i service provider?', 'Dobbiamo costruire integrazioni con ogni provider upstream?', 'I clienti possono portare la propria infrastruttura?', 'Come funziona il billing?'],
    faqA: ['Sì. Operi sotto il tuo brand con portali dedicati, confini di governance e identità indipendenti.', 'Atomosphere federer le classi di servizio supportate, permettendoti di intermediare capacità senza integrazioni individuali.', 'Atomosquare collega patrimoni hypervisor clienti nella tua offerta Metacloud mantenendo governance e controllo.', 'Electros è licenziato a livello di organizzazione. Il consumo infrastrutturale è fatturato separatamente—vedi la pagina prezzi.'],
    ctaPrimary: 'Lancia la tua offerta Metacloud',
    solutionTitle: 'La tua piattaforma Metacloud',
    solutionDesc: 'Intermedia infrastruttura e servizi di terze parti sotto il tuo brand con governance dedicata.',
  },
  'cross-provider-dr': {
    title: 'Disaster recovery senza dipendenza dal provider',
    shortTitle: 'DR cross-provider',
    description: 'Usa un unico control plane per coordinare ambienti primari, DR e fallback tra provider.',
    tag: 'Disaster recovery',
    secondaryCTA: { text: 'Esplora il deployment', link: '../deployment.html', icon: 'fas fa-server' },
    painTitles: ['DR legato al provider', 'RPO/RTO incoerenti', 'Lacune recovery sovrana', 'Failover complesso'],
    painDescs: ['Piani DR legati a un singolo vendor Cloud creano rischio quando quel provider fallisce.', 'Strumenti diversi per ambiente rendono impossibile enforcement unificato degli obiettivi di recovery.', 'Workload regolamentati richiedono target di recovery in giurisdizioni specifiche.', 'Coordinare failover tra provider richiede runbook manuali e automazione fragile.'],
    useTitles: ['Definisci target di recovery', 'Mappa la topologia DR', 'Orchestra il failover', 'Testa e valida'],
    useDescs: ['Imposta governance RPO e RTO unificata su ambienti primari e DR in Electros.', 'Collega endpoint primari, DR e fallback on-premises tra provider.', 'Coordina failover cross-provider con policy e visibilità coerenti.', 'Esegui esercizi DR tra ambienti senza strumenti specifici per provider.'],
    productDesc: { electros: 'Control plane unificato per governance RPO/RTO e coordinamento DR cross-provider.', atomosphere: 'Orchestra failover su provider Cloud pubblici, sovrani e federati.', atomosquare: 'Includi target di fallback on-premises e basati su hypervisor nella topologia DR.', atomos: 'Motore di esecuzione recovery sovrano per siti di fallback regolamentati e air-gapped.' },
    statsLabels: ['Ambito failover', 'RPO/RTO', 'Opzioni fallback'],
    statsValues: ['Cross-provider', 'Unificati', 'On-prem + Cloud'],
    faqQ: ['Il DR può estendersi su più provider Cloud?', 'Come funzionano i target di recovery sovrani?', 'L\'on-premises può essere target DR?', 'Sostituisce la nostra soluzione di backup?'],
    faqA: ['Sì. Electros coordina ambienti primari, DR e fallback tra provider con governance RPO/RTO unificata.', 'Definisci policy di recovery per workload inclusi giurisdizione e residenza. Il failover le rispetta.', 'Atomosquare e AtomOS abilitano fallback on-premises come parte della topologia DR.', 'Elemento coordina orchestrazione e governance del recovery. Complementa backup e replica.'],
    ctaPrimary: 'Progetta DR cross-provider',
    solutionTitle: 'DR indipendente dal provider',
    solutionDesc: 'Coordina ambienti primari, DR e fallback da un unico control plane Metacloud.',
  },
  'data-repatriation': {
    title: 'Sposta i workload quando la sovranità cambia',
    shortTitle: 'Repatriazione dati',
    description: 'Rendi la repatriazione una decisione di policy invece di un progetto di re-ingegnerizzazione.',
    tag: 'Repatriazione dati',
    secondaryCTA: { text: 'Risorse sovranità', link: '../resources.html', icon: 'fas fa-book' },
    painTitles: ['Cambiamenti normativi', 'Carico di re-architettura', 'Perdita di governance', 'Complessità US ↔ EU'],
    painDescs: ['Cambiamenti geopolitici e normativi forzano relocation dei workload con poco preavviso.', 'La repatriazione tradizionale richiede redesign applicativo e mesi di ingegneria.', 'Spostare workload tra provider spesso interrompe audit trail e continuità delle policy.', 'Spostare workload tra provider US e EU comporta modelli operativi incompatibili.'],
    useTitles: ['Valuta l\'esposizione', 'Pianifica la repatriazione', 'Migra con governance', 'Valida la compliance'],
    useDescs: ['Identifica workload colpiti da cambiamenti di sovranità, residenza o policy geopolitiche.', 'Definisci ambienti target e percorsi di migrazione senza re-architettura applicativa.', 'Sposta workload tra provider US/EU o da Cloud pubblico a on-premises preservando le policy.', 'Conferma residenza, audit e continuità operativa nell\'ambiente target.'],
    productDesc: { electros: 'Repatriazione guidata da policy con governance preservata durante la migrazione.', atomosphere: 'Sposta workload tra provider Cloud US, EU e sovrani sotto un unico modello.', atomosquare: 'Repatria da Cloud pubblico a patrimoni hypervisor on-premises senza attrito.', atomos: 'Target di esecuzione sovrano on-premises per workload repatriati.' },
    statsLabels: ['Driver migrazione', 'Re-architettura', 'Governance'],
    statsValues: ['Policy', 'Evitata', 'Preservata'],
    faqQ: ['Possiamo repatriare senza re-architettare le applicazioni?', 'Come spostiamo workload da provider US a EU?', 'Possiamo tornare da Cloud pubblico a on-premises?', 'Cosa attiva un piano di repatriazione?'],
    faqA: ['Sì. Elemento tratta la repatriazione come decisione di placement. I workload si spostano mantenendo modelli operativi coerenti.', 'Atomosphere orchestra il placement tra regioni e provider. Electros applica policy di residenza e giurisdizione.', 'Atomosquare e AtomOS forniscono il target on-premises preservando la governance.', 'Cambiamenti normativi, geopolitici, costi o policy interne. Elemento ti permette di reagire con un piano.'],
    ctaPrimary: 'Costruisci un piano di repatriazione',
    solutionTitle: 'Repatriazione guidata da policy',
    solutionDesc: 'Sposta workload quando la sovranità cambia senza re-ingegnerizzazione o perdita di governance.',
  },
};

const FR = {
  'vmware-exit': {
    title: 'Quitter VMware sans nouveau verrouillage',
    shortTitle: 'Sortie VMware',
    description: 'Gouvernez VMware et AtomOS côte à côte. Migrez charge de travail par charge de travail sans migration massive, sans fenêtres d\'arrêt ni nouveau cycle de dépendance.',
    tag: 'Sortie VMware',
    secondaryCTA: { text: 'Explorer la plateforme', link: '../platform.html', icon: 'fas fa-layer-group' },
    painTitles: ['Simple remplacement d\'hyperviseur', 'Risque de migration massive', 'Nouveau cycle de verrouillage', 'Contrôle fragmenté'],
    painDescs: ['Remplacer VMware par un autre hyperviseur règle les licences mais pas le modèle de dépendance sous-jacent.', 'Les migrations massives créent des fenêtres d\'arrêt et des risques opérationnels sur les charges critiques.', 'Changer de fournisseur sans couche de gouvernance relance simplement le cycle de dépendance ailleurs.', 'Faire coexister des hyperviseurs sans plan de contrôle unifié multiplie la charge opérationnelle.'],
    useTitles: ['Évaluation', 'Gouvernance côte à côte', 'Migration incrémentale', 'Décommissionnement sécurisé'],
    useDescs: ['Inventoriez les environnements VMware et classez les charges selon leur préparation et exigences de souveraineté.', 'Connectez les endpoints VMware et AtomOS dans Electros avec Atomosquare comme pont vers les environnements existants.', 'Déplacez les charges une par une avec des politiques, une supervision et des chemins de retour cohérents.', 'Retirez la capacité VMware au fur et à mesure que la gouvernance passe au modèle Metacloud.'],
    productDesc: { electros: 'Plan de contrôle cohérent gouvernant VMware, AtomOS et les hyperviseurs tiers depuis une seule console.', atomosphere: 'Intermédiez la capacité Cloud et les fournisseurs souverains sans lier les charges à un seul fournisseur.', atomosquare: 'Faites coexister VMware existant, AtomOS et hyperviseurs tiers sous le même modèle de gouvernance.', atomos: 'Moteur d\'exécution souverain natif pour les charges prêtes à quitter VMware.' },
    statsLabels: ['Fenêtres d\'arrêt', 'Modèle de migration', 'Verrouillage fournisseur'],
    statsValues: ['Zéro', 'Incrémentale', 'Évité'],
    faqQ: ['Faut-il une migration massive depuis VMware ?', 'Comment Atomosquare aide-t-il lors de la sortie VMware ?', 'Qu\'advient-il des investissements VMware existants ?', 'En quoi est-ce différent d\'un autre hyperviseur propriétaire ?'],
    faqA: ['Non. Elemento est conçu pour une exploitation côte à côte. Gouvernez VMware et AtomOS ensemble, puis migrez charge par charge à votre rythme.', 'Atomosquare connecte VMware et d\'autres hyperviseurs tiers à Electros pour appliquer les mêmes politiques, supervision et contrôles d\'accès.', 'Vous continuez VMware là où c\'est nécessaire tout en déplaçant progressivement l\'exécution vers AtomOS.', 'Electros fournit un plan de contrôle à l\'échelle de l\'organisation, indépendant d\'un hyperviseur ou Cloud unique. Vous gagnez en portabilité.'],
    ctaPrimary: 'Lancer une évaluation de sortie VMware',
    solutionTitle: 'Le parcours de sortie VMware d\'Elemento',
    solutionDesc: 'Gouvernez des environnements multi-hyperviseurs et migrez progressivement sans nouveau cycle de dépendance.',
  },
  'sovereign-cloud-governance': {
    title: 'La souveraineté comme politique de charge de travail',
    shortTitle: 'Gouvernance Cloud souverain',
    description: 'Appliquez des politiques de juridiction, de résidence et d\'audit sur les Cloud, hyperviseurs et fournisseurs souverains depuis un seul plan de contrôle.',
    tag: 'Gouvernance souveraine',
    secondaryCTA: { text: 'Guide souveraineté', link: '../resources.html', icon: 'fas fa-book' },
    painTitles: ['Complexité juridictionnelle', 'Angles morts de résidence', 'Lacunes d\'audit', 'Prolifération des politiques'],
    painDescs: ['Les exigences réglementaires varient selon la région, la charge et la classification des données.', 'Les données peuvent migrer entre fournisseurs sans application de la résidence par charge.', 'Des outils fragmentés rendent difficile la preuve de l\'emplacement des charges et des accès.', 'Des modèles de gouvernance séparés par Cloud et hyperviseur multiplient la charge de conformité.'],
    useTitles: ['Définir les politiques', 'Cartographier les fournisseurs', 'Appliquer en continu', 'Auditer et rapporter'],
    useDescs: ['Définissez juridiction, résidence et audit comme politiques par charge dans Electros.', 'Connectez fournisseurs souverains, publics et privés via Atomosphere et Atomosquare.', 'Appliquez les politiques sur Cloud et hyperviseurs avec application automatisée et visibilité.', 'Maintenez pistes d\'audit et rapports de conformité depuis une couche de gouvernance unique.'],
    productDesc: { electros: 'Plan de contrôle organisationnel pour politiques de souveraineté, visibilité d\'audit et application.', atomosphere: 'Orchestration cross-fournisseur avec placement tenant compte de la résidence sur Cloud souverains et publics.', atomosquare: 'Étendez la gouvernance à VMware, OpenStack, Proxmox et autres endpoints hyperviseur.', atomos: 'Moteur d\'exécution souverain pour les charges devant tourner sur une infrastructure sous votre contrôle.' },
    statsLabels: ['Portée des politiques', 'Couverture fournisseurs', 'Piste d\'audit'],
    statsValues: ['Par charge', 'Cross-Cloud', 'Unifiée'],
    faqQ: ['Les politiques de souveraineté s\'appliquent-elles sur différents fournisseurs Cloud ?', 'Comment la résidence des données est-elle contrôlée ?', 'Cela remplace-t-il nos outils de conformité ?', 'Peut-on auditer l\'accès en environnement hybride ?'],
    faqA: ['Oui. Electros définit des politiques par charge et les applique sur Cloud public, fournisseurs souverains et infrastructure on-premises.', 'Vous définissez des règles de résidence par charge. Placement et migration les respectent automatiquement.', 'Elemento fournit gouvernance, visibilité d\'audit et application à la couche infrastructure. Il complète les plateformes GRC.', 'Electros centralise la visibilité opérationnelle et les pistes d\'audit sur tous les endpoints connectés.'],
    ctaPrimary: 'Évaluer votre posture de souveraineté',
    solutionTitle: 'Souveraineté comme politique de charge',
    solutionDesc: 'Un modèle de gouvernance pour juridiction, résidence et audit sur chaque Cloud et hyperviseur.',
  },
  'hybrid-multi-cloud': {
    title: 'Un modèle opérationnel pour l\'infrastructure hybride',
    shortTitle: 'Hybride et multi-Cloud',
    description: 'Gérez Cloud public, infrastructure privée, hyperviseurs et edge sans chaînes d\'outils séparées.',
    tag: 'Opérations hybrides',
    secondaryCTA: { text: 'Voir la plateforme', link: '../platform.html', icon: 'fas fa-layer-group' },
    painTitles: ['Chaînes d\'outils séparées', 'Opacité des coûts', 'Lacunes d\'orchestration', 'Fragmentation edge'],
    painDescs: ['Chaque environnement apporte sa console, ses API et ses pratiques opérationnelles.', 'Dépenses et utilisation sont dispersées entre fournisseurs sans vue unifiée.', 'L\'automatisation cross-fournisseur nécessite des intégrations fragiles.', 'Ressources edge, on-premises et Cloud opèrent en silos déconnectés.'],
    useTitles: ['Connecter les environnements', 'Abstraire les ressources', 'Automatiser les opérations', 'Optimiser en continu'],
    useDescs: ['Intégrez Cloud public, infrastructure privée, hyperviseurs et edge dans Electros.', 'Utilisez Atomosphere pour normaliser les API fournisseurs derrière un modèle opérationnel unique.', 'Déployez, scalez et gouvernez les charges avec une automatisation cohérente entre environnements.', 'Suivez coûts, utilisation et gouvernance depuis un tableau de bord unique avec accès distant intégré.'],
    productDesc: { electros: 'Tableau de bord unifié pour gouvernance, visibilité des coûts, automatisation et accès distant.', atomosphere: 'Orchestration cross-fournisseur et abstraction des ressources sur Cloud publics et souverains.', atomosquare: 'Intégrez hyperviseurs privés et plateformes existantes dans le même modèle opérationnel.', atomos: 'Couche d\'exécution cohérente pour charges on-premises et edge.' },
    statsLabels: ['Consoles remplacées', 'Environnements', 'Automatisation'],
    statsValues: ['Plusieurs → Une', 'Unifiés', 'Cross-fournisseur'],
    faqQ: ['Faut-il encore les consoles natives des fournisseurs ?', 'Quels fournisseurs sont pris en charge ?', 'Comment fonctionne l\'accès distant ?', 'Peut-on automatiser entre Cloud et on-premises ?'],
    faqA: ['Pour les tâches spécifiques au fournisseur, oui. Mais les opérations quotidiennes se font dans Electros.', 'Atomosphere connecte les classes de service Cloud prises en charge. Atomosquare étend la couverture aux hyperviseurs privés.', 'Electros fournit un accès distant sécurisé sans prolifération de VPN ou bastions par fournisseur.', 'Oui. Le même modèle d\'automatisation et de politiques s\'applique en Cloud public, data centers privés ou edge.'],
    ctaPrimary: 'Cartographier votre patrimoine infrastructure',
    solutionTitle: 'Un modèle opérationnel',
    solutionDesc: 'Tableau de bord, orchestration et gouvernance unifiés pour infrastructure hybride et multi-Cloud.',
  },
  'ai-gpu-infrastructure': {
    title: 'Gouverner l\'infrastructure IA entre les fournisseurs',
    shortTitle: 'Infrastructure IA et GPU',
    description: 'Provisionnez, supervisez et gouvernez les ressources GPU sur infrastructure locale, privée et fédérée avec le même modèle opérationnel que l\'infrastructure conventionnelle.',
    tag: 'Infrastructure IA',
    secondaryCTA: { text: 'Explorer Electros', link: '../electros.html', icon: 'fas fa-bolt' },
    painTitles: ['Silos GPU', 'Inefficacité d\'allocation', 'Contraintes IA souveraine', 'Divergence opérationnelle'],
    painDescs: ['Les équipes IA jonglent avec des outils séparés pour GPU on-premises, Cloud et fédérés.', 'Des GPU coûteux restent inactifs tandis que la demande se déplace entre environnements.', 'Les charges réglementées ne peuvent pas utiliser des GPU Cloud public sans contrôles de gouvernance.', 'L\'infrastructure IA fonctionne sur un modèle opérationnel différent du reste de l\'IT.'],
    useTitles: ['Inventorier la capacité GPU', 'Allouer par politique', 'Orchestrer l\'IA hybride', 'Gouverner et optimiser'],
    useDescs: ['Découvrez et cataloguez les ressources GPU sur fournisseurs locaux, privés et fédérés.', 'Attribuez des ressources GPU avec politiques de souveraineté, résidence et coût via Electros.', 'Exécutez entraînement et inférence entre environnements avec Atomosphere et GPU passthrough sur AtomOS.', 'Supervisez l\'utilisation, appliquez les politiques et fédérez la consommation sans stack AI ops séparée.'],
    productDesc: { electros: 'Gouvernez allocation, supervision et politiques GPU sur tous les endpoints infrastructure IA.', atomosphere: 'Fédérez la consommation GPU sur fournisseurs Cloud publics, souverains et neocloud.', atomosquare: 'Connectez environnements hyperviseur tiers hébergeant des charges GPU dans un modèle unique.', atomos: 'Infrastructure IA privée avec GPU passthrough pour déploiement souverain et on-premises.' },
    statsLabels: ['Gouvernance GPU', 'Modèle de déploiement', 'IA souveraine'],
    statsValues: ['Unifiée', 'IA hybride', 'Prise en charge'],
    faqQ: ['Electros gère-t-il les GPU comme l\'infrastructure conventionnelle ?', 'Comment fonctionne le déploiement IA souverain ?', 'Peut-on fédérer la consommation GPU entre fournisseurs ?', 'Faut-il une plateforme MLOps séparée ?'],
    faqA: ['Oui. Les ressources GPU sont provisionnées, supervisées et gouvernées via le même plan de contrôle Electros.', 'AtomOS fournit le GPU passthrough sur infrastructure sous votre contrôle. Electros applique résidence et accès.', 'Atomosphere permet l\'accès fédéré à la capacité GPU tout en maintenant allocation et gouvernance dans Electros.', 'Elemento gouverne la couche infrastructure et s\'intègre à vos outils ML existants.'],
    ctaPrimary: 'Planifier une stratégie infrastructure IA',
    solutionTitle: 'Gouvernance infrastructure IA',
    solutionDesc: 'Provisionnez, supervisez et gouvernez les ressources GPU sur infrastructure locale, privée et fédérée.',
  },
  'service-providers': {
    title: 'Élargissez votre portefeuille Cloud sans tout construire',
    shortTitle: 'Fournisseurs de services',
    description: 'Utilisez Elemento comme plan de contrôle Metacloud pour intermédier infrastructure et services tiers sous votre propre modèle de gouvernance.',
    tag: 'Marque blanche',
    secondaryCTA: { text: 'Voir les tarifs', link: '../pricing.html', icon: 'fas fa-tags' },
    painTitles: ['Tout construire', 'Fragmentation d\'identité', 'Coût d\'intégration fournisseurs', 'Time to market lent'],
    painDescs: ['Lancer une offre Cloud signifie construire portails, facturation, gouvernance et intégrations from scratch.', 'Les clients attendent des systèmes d\'identité et des frontières opérationnelles indépendants.', 'Se connecter à plusieurs fournisseurs upstream multiplie l\'effort d\'ingénierie et de maintenance.', 'Construire chaque couche de service retarde les revenus du portefeuille Cloud.'],
    useTitles: ['Lancer le portail', 'Configurer la gouvernance', 'Intermédier les fournisseurs', 'Développer le portefeuille'],
    useDescs: ['Déployez un portail client dédié avec Electros en marque blanche sous votre marque.', 'Définissez identité, contrôle opérationnel et frontières de politiques indépendants par tenant.', 'Fédérez l\'infrastructure upstream via Atomosphere sans construire chaque intégration.', 'Élargissez classes de service et fournisseurs au fil de la croissance de votre offre Metacloud.'],
    productDesc: { electros: 'Plan de contrôle Metacloud en marque blanche avec gouvernance dédiée et systèmes d\'identité indépendants.', atomosphere: 'Couche de fédération pour intermédier infrastructure et classes de service Cloud tiers.', atomosquare: 'Intégrez patrimoines hyperviseur clients et endpoints hybrides dans votre offre.', atomos: 'Moteur d\'exécution souverain pour infrastructure hébergée ou gérée par le client.' },
    statsLabels: ['Time to market', 'Contrôle de marque', 'Fédération fournisseurs'],
    statsValues: ['Plus rapide', 'Marque blanche', 'Intégrée'],
    faqQ: ['Electros est-il vraiment en marque blanche pour les fournisseurs de services ?', 'Faut-il construire des intégrations avec chaque fournisseur upstream ?', 'Les clients peuvent-ils apporter leur infrastructure ?', 'Comment fonctionne la facturation ?'],
    faqA: ['Oui. Vous opérez sous votre marque avec portails dédiés, frontières de gouvernance et identités indépendantes.', 'Atomosphere fédère les classes de service prises en charge pour intermédier la capacité sans intégrations individuelles.', 'Atomosquare connecte les patrimoines hyperviseur clients dans votre offre Metacloud en conservant gouvernance et contrôle.', 'Electros est licencié au niveau organisation. La consommation infrastructure est facturée séparément — voir la page tarifs.'],
    ctaPrimary: 'Lancer votre offre Metacloud',
    solutionTitle: 'Votre plateforme Metacloud',
    solutionDesc: 'Intermédiez infrastructure et services tiers sous votre marque avec gouvernance dédiée.',
  },
  'cross-provider-dr': {
    title: 'Reprise après sinistre sans dépendance fournisseur',
    shortTitle: 'DR cross-fournisseur',
    description: 'Utilisez un plan de contrôle unique pour coordonner environnements primaires, DR et secours entre fournisseurs.',
    tag: 'Reprise après sinistre',
    secondaryCTA: { text: 'Explorer le déploiement', link: '../deployment.html', icon: 'fas fa-server' },
    painTitles: ['DR lié au fournisseur', 'RPO/RTO incohérents', 'Lacunes recovery souverain', 'Basculement complexe'],
    painDescs: ['Des plans DR liés à un seul fournisseur Cloud créent un risque quand ce fournisseur tombe en panne.', 'Des outils différents par environnement rendent impossible l\'application unifiée des objectifs de recovery.', 'Les charges réglementées exigent des cibles de recovery dans des juridictions spécifiques.', 'Coordonner le basculement entre fournisseurs nécessite des runbooks manuels et une automatisation fragile.'],
    useTitles: ['Définir les objectifs de recovery', 'Cartographier la topologie DR', 'Orchestrer le basculement', 'Tester et valider'],
    useDescs: ['Définissez une gouvernance RPO/RTO unifiée sur environnements primaires et DR dans Electros.', 'Connectez endpoints primaires, DR et secours on-premises entre fournisseurs.', 'Coordonnez le basculement cross-fournisseur avec politiques et visibilité cohérentes.', 'Exécutez des exercices DR entre environnements sans outils spécifiques par fournisseur.'],
    productDesc: { electros: 'Plan de contrôle unifié pour gouvernance RPO/RTO et coordination DR cross-fournisseur.', atomosphere: 'Orchestrez le basculement sur fournisseurs Cloud publics, souverains et fédérés.', atomosquare: 'Incluez cibles de secours on-premises et hyperviseur dans la topologie DR.', atomos: 'Moteur d\'exécution recovery souverain pour sites de secours réglementés et isolés.' },
    statsLabels: ['Portée basculement', 'RPO/RTO', 'Options de secours'],
    statsValues: ['Cross-fournisseur', 'Unifiés', 'On-prem + Cloud'],
    faqQ: ['Le DR peut-il s\'étendre à plusieurs fournisseurs Cloud ?', 'Comment fonctionnent les cibles de recovery souveraines ?', 'L\'on-premises peut-il être une cible DR ?', 'Cela remplace-t-il notre solution de sauvegarde ?'],
    faqA: ['Oui. Electros coordonne environnements primaires, DR et secours entre fournisseurs avec gouvernance RPO/RTO unifiée.', 'Vous définissez des politiques de recovery par charge incluant juridiction et résidence. Le basculement les respecte.', 'Atomosquare et AtomOS permettent le secours on-premises dans votre topologie DR.', 'Elemento coordonne l\'orchestration et la gouvernance du recovery. Il complète sauvegarde et réplication.'],
    ctaPrimary: 'Concevoir un DR cross-fournisseur',
    solutionTitle: 'DR indépendant du fournisseur',
    solutionDesc: 'Coordonnez environnements primaires, DR et secours depuis un plan de contrôle Metacloud unique.',
  },
  'data-repatriation': {
    title: 'Déplacer les charges quand la souveraineté change',
    shortTitle: 'Rapatriement des données',
    description: 'Faites du rapatriement une décision de politique plutôt qu\'un projet de ré-ingénierie.',
    tag: 'Rapatriement des données',
    secondaryCTA: { text: 'Ressources souveraineté', link: '../resources.html', icon: 'fas fa-book' },
    painTitles: ['Évolutions réglementaires', 'Charge de ré-architecture', 'Perte de gouvernance', 'Complexité US ↔ EU'],
    painDescs: ['Changements géopolitiques et réglementaires imposent des relocations de charges avec peu de préavis.', 'Le rapatriement traditionnel exige une refonte applicative et des mois d\'ingénierie.', 'Déplacer des charges entre fournisseurs interrompt souvent pistes d\'audit et continuité des politiques.', 'Basculer entre fournisseurs US et EU implique des modèles opérationnels incompatibles.'],
    useTitles: ['Évaluer l\'exposition', 'Planifier le rapatriement', 'Migrer avec gouvernance', 'Valider la conformité'],
    useDescs: ['Identifiez les charges affectées par changements de souveraineté, résidence ou politiques géopolitiques.', 'Définissez environnements cibles et chemins de migration sans ré-architecture applicative.', 'Déplacez charges entre fournisseurs US/EU ou du Cloud public vers on-premises en préservant les politiques.', 'Confirmez résidence, audit et continuité opérationnelle dans l\'environnement cible.'],
    productDesc: { electros: 'Rapatriement piloté par politique avec gouvernance préservée tout au long de la migration.', atomosphere: 'Déplacez charges entre fournisseurs Cloud US, EU et souverains sous un modèle unique.', atomosquare: 'Rapatriez du Cloud public vers patrimoines hyperviseur on-premises sans friction.', atomos: 'Cible d\'exécution souveraine on-premises pour charges rapatriées.' },
    statsLabels: ['Moteur de migration', 'Ré-architecture', 'Gouvernance'],
    statsValues: ['Politique', 'Évitée', 'Préservée'],
    faqQ: ['Peut-on rapatrier sans ré-architecturer les applications ?', 'Comment déplacer des charges de fournisseurs US vers EU ?', 'Peut-on revenir du Cloud public vers on-premises ?', 'Qu\'est-ce qui déclenche un plan de rapatriement ?'],
    faqA: ['Oui. Elemento traite le rapatriement comme une décision de placement. Les charges se déplacent avec des modèles opérationnels cohérents.', 'Atomosphere orchestre le placement entre régions et fournisseurs. Electros applique résidence et juridiction.', 'Atomosquare et AtomOS fournissent la cible on-premises en préservant la gouvernance.', 'Changements réglementaires, géopolitiques, coûts ou politiques internes. Elemento permet de réagir avec un plan.'],
    ctaPrimary: 'Élaborer un plan de rapatriement',
    solutionTitle: 'Rapatriement piloté par politique',
    solutionDesc: 'Déplacez les charges quand la souveraineté change sans ré-ingénierie ni perte de gouvernance.',
  },
};

function buildLocale(s, tr, locale) {
  const painPoints = s.painPoints.map((p, i) => ({
    icon: p.icon,
    title: tr ? tr.painTitles[i] : p.title,
    description: tr ? tr.painDescs[i] : p.description,
  }));
  const useCase = s.useCase.map((u, i) => ({
    number: u.number,
    title: tr ? tr.useTitles[i] : u.title,
    description: tr ? tr.useDescs[i] : u.description,
  }));
  const desc = tr ? tr.productDesc : s.productDesc;
  const stats = s.stats.map((st, i) => ({
    ...st,
    label: tr ? tr.statsLabels[i] : st.label,
    value: tr ? tr.statsValues[i] : st.value,
  }));
  const faq = s.faq.map((f, i) => ({
    question: tr ? tr.faqQ[i] : f.question,
    answer: tr ? tr.faqA[i] : f.answer,
  }));

  return {
    hero: {
      tagline: tr ? tr.tag : s.tag,
      title: tr ? tr.title : s.title,
      subtitle: tr ? tr.description : s.description,
      primaryCTA: {
        text: tr ? tr.ctaPrimary : s.ctaPrimary,
        link: s.ctaLink,
        icon: 'fas fa-rocket',
      },
      secondaryCTA: tr ? tr.secondaryCTA : s.secondaryCTA,
    },
    painPoints: {
      title: tr
        ? locale === 'it'
          ? `Le sfide di ${tr.shortTitle}`
          : `Les défis ${tr.shortTitle}`
        : `${s.shortTitle} Challenges You Face`,
      subtitle: tr
        ? locale === 'it'
          ? 'Punti critici che limitano la modernizzazione dell\'infrastruttura'
          : 'Points critiques qui limitent la modernisation de l\'infrastructure'
        : `Common pain points that limit your ${s.shortTitle.toLowerCase()} goals`,
      items: painPoints,
    },
    solution: {
      title: tr ? tr.solutionTitle : s.solutionTitle,
      description: tr ? tr.solutionDesc : s.solutionDesc,
      items: solutionItems(desc),
      cta: { text: tr ? tr.ctaPrimary : s.ctaPrimary, link: s.ctaLink },
    },
    useCase: {
      title: tr ? (locale === 'it' ? `Percorso ${tr.shortTitle}` : `Parcours ${tr.shortTitle}`) : `${s.shortTitle} Journey`,
      subtitle: tr ? (locale === 'it' ? 'Un approccio strutturato con il Metacloud Elemento' : 'Une approche structurée avec le Metacloud Elemento') : `A structured approach with Elemento's Metacloud platform`,
      items: useCase,
    },
    stats: {
      title: tr ? (locale === 'it' ? `Impatto ${tr.shortTitle}` : `Impact ${tr.shortTitle}`) : `${s.shortTitle} Impact`,
      subtitle: tr ? (locale === 'it' ? 'Risultati concreti con la piattaforma Metacloud' : 'Résultats concrets avec la plateforme Metacloud') : `Real outcomes with the Metacloud platform`,
      items: stats,
    },
    faq: {
      title: tr ? (locale === 'it' ? `FAQ ${tr.shortTitle}` : `FAQ ${tr.shortTitle}`) : `${s.shortTitle} FAQ`,
      subtitle: tr ? (locale === 'it' ? 'Domande frequenti sulla soluzione Elemento' : 'Questions fréquentes sur la solution Elemento') : `Common questions about Elemento's ${s.shortTitle.toLowerCase()} solution`,
      items: faq,
    },
    ctaFinal: {
      title: tr ? (locale === 'it' ? `Pronto per ${tr.shortTitle}?` : `Prêt pour ${tr.shortTitle} ?`) : `Ready for ${s.shortTitle}?`,
      subtitle: tr ? (locale === 'it' ? 'Scopri come Elemento può trasformare il tuo modello operativo infrastrutturale.' : 'Découvrez comment Elemento peut transformer votre modèle opérationnel infrastructure.') : `Discover how Elemento can transform your infrastructure operating model.`,
      primaryCTA: {
        text: tr ? tr.ctaPrimary : s.ctaPrimary,
        link: s.ctaLink,
        icon: 'fas fa-rocket',
      },
      secondaryCTA: {
        text: locale === 'it' ? 'Pianifica una demo' : locale === 'fr' ? 'Planifier une démo' : 'Schedule a Demo',
        link: '../contact.html',
        icon: 'fas fa-calendar',
      },
    },
  };
}

function buildHtml(s) {
  const slug = s.slug;
  const url = `https://elemento.cloud/solutions/${slug}.html`;
  let html = TEMPLATE;

  // Replace head meta
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${s.title} | Elemento</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${s.description}"`);
  html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`);
  html = html.replace(/<link rel="alternate" hreflang="en" href="[^"]*"/, `<link rel="alternate" hreflang="en" href="${url}"`);
  html = html.replace(/<link rel="alternate" hreflang="it" href="[^"]*"/, `<link rel="alternate" hreflang="it" href="https://elemento.cloud/it/solutions/${slug}.html"`);
  html = html.replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"/, `<link rel="alternate" hreflang="x-default" href="${url}"`);
  html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${s.title} | Elemento"`);
  html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${s.description}"`);
  html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${s.title} | Elemento"`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${s.description}"`);
  html = html.replace(/<meta name="keywords" content="[^"]*"/, `<meta name="keywords" content="${s.keywords}"`);
  html = html.replace(/"name": "[^"]*",\s*\n\s*"description": "[^"]*",\s*\n\s*"url": "[^"]*"/,
    `"name": "${s.title}",\n      "description": "${s.description}",\n      "url": "${url}"`);

  // Replace main content with component placeholders only
  const mainRe = /<main id="main-content">[\s\S]*?<\/main>/;
  const main = `    <main id="main-content">        
        <!-- Hero Section -->
        <section id="hero-section" data-component="hero-technical"></section>
        
        <!-- Pain Points -->
        <section id="pain-points" data-component="pain-points"></section>
        
        <!-- Solution Overview -->
        <section id="solution" data-component="solution-overview"></section>

        <!-- Use Case Walkthrough -->
        <section id="use-case" data-component="use-case-walkthrough"></section>
        
        <!-- Stats -->
        <section id="stats" data-component="stats-metrics"></section>
        
        <!-- FAQ -->
        <section id="faq" data-component="faq-section"></section>
        
        <!-- Final CTA -->
        <section id="cta-final" data-component="cta-final"></section>
    </main>`;
  html = html.replace(mainRe, main);

  html = html.replace(/data-solution-config="vmware-alternative"/g, `data-solution-config="${slug}"`);

  return html;
}

// Generate files
for (const s of SOLUTIONS) {
  writeFileSync(join(ROOT, `solutions/${s.slug}.html`), buildHtml(s));
  const cms = {
    en: buildLocale(s, null, 'en'),
    it: buildLocale(s, IT[s.slug], 'it'),
    fr: buildLocale(s, FR[s.slug], 'fr'),
  };
  writeFileSync(join(ROOT, `CMS/solutions/${s.slug}.json`), JSON.stringify(cms, null, 2) + '\n');
  console.log(`Created ${s.slug}`);
}

console.log('Done.');
