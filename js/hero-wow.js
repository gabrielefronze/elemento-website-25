/**
 * Hero Metacloud constellation.
 *
 * Provider + hypervisor glassmorphism cards revolve around the word "Metacloud"
 * in the headline along concentric ellipses (ring 0 closest), each joined to the
 * word by a smoothly arched, animated link line. The word is the shared orbit
 * center; rings rotate at different speeds for a galaxy feel. Cards on each
 * ring share a fixed radius and angular velocity so slots never collide. The far
 * arc compresses vertically for forced perspective.
 * Disabled on small portrait viewports — phones get copy + CTAs only.
 */
(function () {
    'use strict';

    var SMALL_PORTRAIT_MQ = '(max-width: 768px) and (orientation: portrait)';

    var SVGNS = 'http://www.w3.org/2000/svg';

    function assetUrl(path) {
        var normalized = String(path).replace(/^\//, '').replace(/^\.\//, '');
        if (window.ElementoI18n && window.ElementoI18n.assetUrl) {
            return window.ElementoI18n.assetUrl(normalized);
        }
        return normalized;
    }

    // angle: optional fixed angle (degrees); slot: optional index on ring (default: array order).
    var PROVIDERS = [
        // Hypervisors / virtualization
        { name: 'AtomOS', tag: 'Sovereign hypervisor', img: 'assets/logos/Atomos.svg', accent: 'var(--atomos-color, #007bff)', kind: 'hypervisor', ring: 0 },
        { name: 'Proxmox', tag: 'Hypervisor', icon: 'fas fa-box', accent: '#E57000', kind: 'hypervisor', ring: 0 },
        { name: 'VMware', tag: 'Hypervisor', icon: 'fas fa-layer-group', accent: '#9AAEC0', kind: 'hypervisor', ring: 0 },
        { name: 'KVM', tag: 'Virtualization', icon: 'fas fa-microchip', accent: '#D33', kind: 'hypervisor', ring: 1 },
        { name: 'Hyper-V', tag: 'Hypervisor', icon: 'fab fa-windows', accent: '#2E8DEF', kind: 'hypervisor', ring: 1 },
        { name: 'Nutanix', tag: 'Hypervisor', icon: 'fas fa-cubes', accent: '#3B82C4', kind: 'hypervisor', ring: 2 },
        { name: 'Red Hat', tag: 'Virtualization', icon: 'fab fa-redhat', accent: '#EE0000', kind: 'hypervisor', ring: 2 },
        { name: 'OpenStack', tag: 'Private cloud', icon: 'fas fa-server', accent: '#E0408A', kind: 'hypervisor', ring: 2 },

        // Clouds
        { name: 'AWS', tag: 'Public cloud', icon: 'fab fa-aws', accent: '#FF9900', kind: 'cloud', ring: 0 },
        { name: 'Azure', tag: 'Public cloud', icon: 'fab fa-microsoft', accent: '#2E8DEF', kind: 'cloud', ring: 0 },
        { name: 'Google Cloud', tag: 'Public cloud', icon: 'fab fa-google', accent: '#4285F4', kind: 'cloud', ring: 1 },
        { name: 'OVHcloud', tag: 'Sovereign cloud', icon: 'fas fa-cloud', accent: '#2272C9', kind: 'cloud', ring: 1 },
        { name: 'Scaleway', tag: 'Sovereign cloud', icon: 'fas fa-server', accent: '#8C52FF', kind: 'cloud', ring: 1 },
        { name: 'Wasabi', tag: 'Object storage', icon: 'fas fa-database', accent: '#00C65E', kind: 'cloud', ring: 1 },
        { name: 'Oracle', tag: 'Public cloud', icon: 'fas fa-database', accent: '#C74634', kind: 'cloud', ring: 2 },
        { name: 'IBM Cloud', tag: 'Public cloud', icon: 'fas fa-cloud', accent: '#0F62FE', kind: 'cloud', ring: 2 },
        { name: 'Alibaba', tag: 'Public cloud', icon: 'fas fa-cloud', accent: '#FF6A00', kind: 'cloud', ring: 2 },
        { name: 'DigitalOcean', tag: 'Public cloud', icon: 'fab fa-digital-ocean', accent: '#0080FF', kind: 'cloud', ring: 2 },
        { name: 'Impossible Cloud', tag: 'Sovereign cloud', icon: 'fas fa-cloud', accent: '#00C65E', kind: 'cloud', ring: 2 },
        { name: 'UpCloud', tag: 'Sovereign cloud', icon: 'fas fa-cloud', accent: '#7B68EE', kind: 'cloud', ring: 2 }
    ];

    var RING_H = [0.24, 0.33, 0.42];
    var RING_V = [0.17, 0.27, 0.36];
    var RING_SCALE = [1, 0.94, 0.86];
    var RING_OP = [1, 0.92, 0.82];
    // Orbital period per ring, in ms (inner faster, outer slower). All cards on a ring share this period.
    var RING_PERIOD = [72000, 98000, 138000];
    var RING_OMEGA = RING_PERIOD.map(function (period) {
        return (2 * Math.PI) / period;
    });
    // Fixed ring phase offsets (rad) so adjacent rings interleave rather than stack.
    var RING_PHASE = [0, Math.PI / 6, Math.PI / 8];
    // Far arc (top of ellipse): squash vertical reach for forced perspective.
    var FAR_V_COMPRESS = 0.38;
    // Curve amount for the arched link lines (fraction of chord length).
    var ARCH = 0.16;
    // Link dash: near side full weight; far side thinner stroke + tighter dashes.
    var LINE_DASH_FLOW_MS = 1300;
    var LINE_DASH_NEAR = { len: 2, gap: 9, width: 1.4 };
    var LINE_DASH_FAR = { len: 0.75, gap: 4.5, width: 0.7 };
    var LINE_BASE_NEAR = 1;
    var LINE_BASE_FAR = 0.5;
    // Far-side depth cue: subtle gaussian blur instead of opacity fade.
    var FAR_BLUR_MAX = 2;
    var FAR_BLUR_MAX_SAFARI = 1.1;
    // Mouse parallax (pointer: fine only; disabled with reduced motion). Orbit only — hero copy stays fixed.
    var PARALLAX_ORBIT_MAX = 14;
    var PARALLAX_LERP = 0.065;
    var PARALLAX_RING_FACTOR = [1, 0.68, 0.42];
    // Scroll parallax — headline + orbit exit the fold faster than the page scroll.
    var SCROLL_PARALLAX_RATE = 0.42;
    // Cap render rate — 60fps.
    var FRAME_MS = 16;
    // Safari: synced frames, integer paths, batched SVG writes (see renderLines).
    var FRAME_MS_SAFARI = 32;
    // Metacloud hub pulse — every 2s, 1–2 foreground cards; each highlight decays over 7s.
    var HUB_PULSE_COLOR = '#ffa600';
    var HUB_PULSE_INTERVAL = 2000;
    var HUB_PULSE_DECAY = 7000;
    var HUB_PULSE_FADE_IN = 400;
    var METACLOUD_PULSE_SCALE = 0.38;
    // Ephemeral migration segments — cloud↔cloud and workloads moving toward AtomOS.
    var MIGRATION_MAX = 3;
    var MIGRATION_POOL = 4;
    var MIGRATION_SPAWN_MIN = 2200;
    var MIGRATION_SPAWN_JITTER = 1800;
    var MIGRATION_DURATION_MIN = 1600;
    var MIGRATION_DURATION_JITTER = 900;
    var MIGRATION_SPARK_LEN = 9;

    var IS_SAFARI = (function () {
        var ua = navigator.userAgent;
        return /AppleWebKit/i.test(ua) && !/Chrome|CriOS|Chromium|Edg/i.test(ua);
    })();

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function isSmallPortraitViewport() {
        return window.matchMedia(SMALL_PORTRAIT_MQ).matches;
    }

    function resetHeroBlocks() {
        document.querySelectorAll('.hero-home__headline, .hero-home__cta').forEach(function (el) {
            el.style.transform = '';
            el.style.position = '';
            el.style.zIndex = '';
        });
    }

    /**
     * Assign a fixed angular slot to each provider on its ring.
     * Cards on the same ring are evenly spaced; optional p.angle (degrees) or p.slot overrides.
     */
    function assignStartAngles(providers) {
        var byRing = [[], [], []];
        providers.forEach(function (p) {
            if (typeof p.angle === 'number') {
                p.startAngle = p.angle * Math.PI / 180;
                return;
            }
            byRing[p.ring].push(p);
        });

        byRing.forEach(function (group, ring) {
            if (!group.length) return;
            var n = group.length;
            var step = (Math.PI * 2) / n;
            var phase = RING_PHASE[ring] || 0;
            group.forEach(function (p, i) {
                var slot = typeof p.slot === 'number' ? p.slot : i;
                p.startAngle = phase + step * slot;
            });
        });
    }

    var state = null;

    function buildCard(p) {
        var media = p.img
            ? '<img class="provider-float__img" src="' + assetUrl(p.img) + '" alt="" aria-hidden="true">'
            : '<i class="' + p.icon + '"></i>';
        var el = document.createElement('div');
        el.className = 'provider-float provider-float--r' + p.ring;
        el.style.setProperty('--accent', p.accent);
        el.style.left = '0';
        el.style.top = '0';
        el.innerHTML =
            '<span class="provider-float__logo">' + media + '</span>' +
            '<span class="provider-float__text"><strong>' + p.name + '</strong><small>' + p.tag + '</small></span>';
        return el;
    }

    function buildLine(p, index) {
        var stroke = p.accent;
        var baseLine = document.createElementNS(SVGNS, 'path');
        baseLine.setAttribute('class', 'hero-link-base');
        baseLine.style.stroke = stroke;

        var flow = document.createElementNS(SVGNS, 'path');
        flow.setAttribute('class', 'hero-link');
        flow.style.stroke = stroke;
        flow.style.animationDelay = (index * 0.12).toFixed(2) + 's';

        return { base: baseLine, flow: flow };
    }

    function archPath(x1, y1, x2, y2, round) {
        if (round) {
            x1 = Math.round(x1);
            y1 = Math.round(y1);
            x2 = Math.round(x2);
            y2 = Math.round(y2);
        }
        var mx = (x1 + x2) / 2;
        var my = (y1 + y2) / 2;
        var dx = x2 - x1;
        var dy = y2 - y1;
        var len = Math.hypot(dx, dy) || 1;
        var cxp = mx;
        var cyp = my - len * ARCH;
        if (round) {
            return 'M' + x1 + ' ' + y1 +
                ' Q' + Math.round(cxp) + ' ' + Math.round(cyp) +
                ' ' + x2 + ' ' + y2;
        }
        return 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
            ' Q ' + cxp.toFixed(1) + ' ' + cyp.toFixed(1) +
            ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    }

    /** Curved bridge between two orbiting cards — always bows inward toward Metacloud. */
    function bridgePath(x1, y1, x2, y2, hubX, hubY, round) {
        var mx = (x1 + x2) * 0.5;
        var my = (y1 + y2) * 0.5;
        var dx = x2 - x1;
        var dy = y2 - y1;
        var len = Math.hypot(dx, dy) || 1;
        var tx = hubX - mx;
        var ty = hubY - my;
        var tLen = Math.hypot(tx, ty) || 1;
        var bow = len * ARCH;
        var cxp = mx + (tx / tLen) * bow;
        var cyp = my + (ty / tLen) * bow;
        if (round) {
            return 'M' + Math.round(x1) + ' ' + Math.round(y1) +
                ' Q' + Math.round(cxp) + ' ' + Math.round(cyp) +
                ' ' + Math.round(x2) + ' ' + Math.round(y2);
        }
        return 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
            ' Q ' + cxp.toFixed(1) + ' ' + cyp.toFixed(1) +
            ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    }

    function migrationEnvelope(t) {
        if (t <= 0 || t >= 1) return 0;
        if (t < 0.14) return t / 0.14;
        if (t > 0.78) return (1 - t) / 0.22;
        return 1;
    }

    function migrationEase(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function migrationEndpoints(fromIt, toIt) {
        var x1 = fromIt._x;
        var y1 = fromIt._y;
        var x2 = toIt._x;
        var y2 = toIt._y;
        var e1 = rectEdgeToward(x1, y1, x2, y2, fromIt._halfW || 70, fromIt._halfH || 22);
        var e2 = rectEdgeToward(x2, y2, x1, y1, toIt._halfW || 70, toIt._halfH || 22);
        return { x1: e1.x, y1: e1.y, x2: e2.x, y2: e2.y };
    }

    function initMigrationPool(svg) {
        var migGroup = document.createElementNS(SVGNS, 'g');
        migGroup.setAttribute('class', 'hero-migrations');
        svg.appendChild(migGroup);

        var pool = [];
        for (var m = 0; m < MIGRATION_POOL; m++) {
            var trail = document.createElementNS(SVGNS, 'path');
            trail.setAttribute('class', 'hero-migration-trail');
            trail.style.display = 'none';
            var spark = document.createElementNS(SVGNS, 'path');
            spark.setAttribute('class', 'hero-migration-spark');
            spark.style.display = 'none';
            migGroup.appendChild(trail);
            migGroup.appendChild(spark);
            pool.push({ trail: trail, spark: spark, active: false });
        }
        return pool;
    }

    function acquireMigrationPaths() {
        if (!state || !state.migrationPool) return null;
        for (var i = 0; i < state.migrationPool.length; i++) {
            if (!state.migrationPool[i].active) return state.migrationPool[i];
        }
        return null;
    }

    function releaseMigrationPaths(paths) {
        paths.active = false;
        paths.trail.style.display = 'none';
        paths.spark.style.display = 'none';
        paths.trail.removeAttribute('d');
        paths.spark.removeAttribute('d');
    }

    function showMigrationPaths(paths) {
        paths.trail.style.display = '';
        paths.spark.style.display = '';
    }

    function setMigrationPathD(paths, d) {
        paths.trail.setAttribute('d', d);
        paths.spark.setAttribute('d', d);
    }

    /** Growing yellow trail + bright spark head along path progress (0–1). */
    function applyMigrationStroke(paths, pathLen, progress, alpha) {
        var progressLen = Math.max(1, pathLen * progress);
        var sparkLen = Math.min(MIGRATION_SPARK_LEN, progressLen);
        var trailDash = progressLen.toFixed(1) + ' ' + pathLen.toFixed(1);
        var sparkOff = Math.max(0, progressLen - sparkLen);

        if (paths._trailDash !== trailDash) {
            paths.trail.setAttribute('stroke-dasharray', trailDash);
            paths.trail.setAttribute('stroke-dashoffset', '0');
            paths._trailDash = trailDash;
        }

        var sparkDash = sparkLen.toFixed(1) + ' ' + (pathLen + sparkLen).toFixed(1);
        var sparkDashOff = String(-sparkOff);
        if (paths._sparkDash !== sparkDash + '|' + sparkDashOff) {
            paths.spark.setAttribute('stroke-dasharray', sparkDash);
            paths.spark.setAttribute('stroke-dashoffset', sparkDashOff);
            paths._sparkDash = sparkDash + '|' + sparkDashOff;
        }

        var trailOp = (0.62 * alpha).toFixed(3);
        var sparkOp = alpha.toFixed(3);
        if (paths._trailOp !== trailOp) {
            paths.trail.style.opacity = trailOp;
            paths._trailOp = trailOp;
        }
        if (paths._sparkOp !== sparkOp) {
            paths.spark.style.opacity = sparkOp;
            paths._sparkOp = sparkOp;
        }
    }

    function activeMigrationIndices(now) {
        var out = [];
        state.items.forEach(function (it, i) {
            if (it.hidden || it._x == null) return;
            if (!isForegroundOrbit(i, now)) return;
            if ((it._lineOpVal || 0) < 0.32) return;
            out.push(i);
        });
        return out;
    }

    function pickMigrationPair(now) {
        var active = activeMigrationIndices(now);
        if (active.length < 2) return null;

        var atomos = state.atomosIdx;
        var atomosActive = atomos >= 0 && active.indexOf(atomos) !== -1;

        if (atomosActive && Math.random() < 0.58) {
            var sources = active.filter(function (i) {
                return i !== atomos && state.items[i].kind === 'hypervisor';
            });
            if (!sources.length) {
                sources = active.filter(function (i) {
                    return i !== atomos && state.items[i].kind === 'cloud';
                });
            }
            if (!sources.length) {
                sources = active.filter(function (i) { return i !== atomos; });
            }
            if (!sources.length) return null;
            return {
                from: sources[Math.floor(Math.random() * sources.length)],
                to: atomos,
                type: 'atomos'
            };
        }

        var clouds = active.filter(function (i) {
            return state.items[i].kind === 'cloud';
        });
        if (clouds.length >= 2) {
            var c1 = clouds[Math.floor(Math.random() * clouds.length)];
            var c2 = clouds.filter(function (i) { return i !== c1; });
            c2 = c2[Math.floor(Math.random() * c2.length)];
            return { from: c1, to: c2, type: 'cloud' };
        }

        var hypervisors = active.filter(function (i) {
            return state.items[i].kind === 'hypervisor' && i !== atomos;
        });
        if (hypervisors.length < 2) return null;
        var h1 = hypervisors[Math.floor(Math.random() * hypervisors.length)];
        var h2 = hypervisors.filter(function (i) { return i !== h1; });
        h2 = h2[Math.floor(Math.random() * h2.length)];
        return { from: h1, to: h2, type: 'bridge' };
    }

    function trySpawnMigration(now) {
        var paths = acquireMigrationPaths();
        if (!paths) return null;

        var pair = pickMigrationPair(now);
        if (!pair) return null;

        paths.active = true;
        paths._trailDash = null;
        paths._sparkDash = null;
        paths._trailOp = null;
        paths._sparkOp = null;
        showMigrationPaths(paths);
        pulseMigrationCard(pair.from, now);

        return {
            from: pair.from,
            to: pair.to,
            type: pair.type,
            start: now,
            duration: MIGRATION_DURATION_MIN + Math.random() * MIGRATION_DURATION_JITTER,
            paths: paths,
            _pathD: null,
            _pathLen: 0,
            _toPulsed: false
        };
    }

    function tickMigrations(now) {
        if (!state || state.reduced || !shouldAnimate() || !state.migrations) return;

        state.migrations = state.migrations.filter(function (m) {
            if (now - m.start >= m.duration) {
                releaseMigrationPaths(m.paths);
                return false;
            }
            return true;
        });

        if (now < state.migrationNextAt) return;
        if (state.migrations.length >= MIGRATION_MAX) return;

        var mig = trySpawnMigration(now);
        if (mig) state.migrations.push(mig);
        state.migrationNextAt = now + MIGRATION_SPAWN_MIN + Math.random() * MIGRATION_SPAWN_JITTER;
    }

    function renderMigrations(now) {
        if (!state || !state.migrations || !state.migrations.length) return;

        state.migrations.forEach(function (m) {
            var fromIt = state.items[m.from];
            var toIt = state.items[m.to];
            if (!fromIt || !toIt || fromIt.hidden || toIt.hidden || fromIt._x == null || toIt._x == null) {
                return;
            }

            var t = (now - m.start) / m.duration;
            var alpha = migrationEnvelope(t);
            if (alpha <= 0) return;

            var ep = migrationEndpoints(fromIt, toIt);
            var d = bridgePath(ep.x1, ep.y1, ep.x2, ep.y2, state.cx, state.cy, state.roundPath);
            if (m._pathD !== d) {
                setMigrationPathD(m.paths, d);
                m._pathD = d;
                m._pathLen = m.paths.spark.getTotalLength();
            }

            var eased = migrationEase(Math.min(1, Math.max(0, t)));
            var pathLen = m._pathLen || 1;
            applyMigrationStroke(m.paths, pathLen, eased, alpha);

            if (!m._toPulsed && eased >= 0.95) {
                clearMigrationCardPulse(m.from);
                pulseMigrationCard(m.to, now);
                m._toPulsed = true;
            }
        });
    }

    /** Point on a card's axis-aligned bounds along the ray toward (tx, ty). */
    function rectEdgeToward(cx, cy, tx, ty, halfW, halfH) {
        var dx = tx - cx;
        var dy = ty - cy;
        var len = Math.hypot(dx, dy);
        if (len < 0.001 || !halfW || !halfH) {
            return { x: cx, y: cy };
        }
        var ux = dx / len;
        var uy = dy / len;
        var t = Infinity;
        if (ux > 0) t = Math.min(t, halfW / ux);
        else if (ux < 0) t = Math.min(t, -halfW / ux);
        if (uy > 0) t = Math.min(t, halfH / uy);
        else if (uy < 0) t = Math.min(t, -halfH / uy);
        if (!isFinite(t)) t = 0;
        return { x: cx + ux * t, y: cy + uy * t };
    }

    /** Near arc = 1 (base CSS size, never upscaled). Far arc zooms out toward perspMin. */
    function cardPerspectiveScale(near, ringScale, pMin) {
        var depth = pMin + (1 - pMin) * near;
        var ringBlend = 1 - (1 - ringScale) * (1 - near);
        return Math.min(1, depth * ringBlend);
    }

    function hubPulseEnvelope(now) {
        var pulse = state && state.hubPulse;
        if (!pulse || !pulse.metacloudStart) return 0;
        return hubPulseStrengthAt(now, pulse.metacloudStart);
    }

    function hubPulseStrengthAt(now, start) {
        if (!start) return 0;
        var t = now - start;
        if (t < 0 || t > HUB_PULSE_DECAY) return 0;
        if (t < HUB_PULSE_FADE_IN) return t / HUB_PULSE_FADE_IN;
        var decayLen = HUB_PULSE_DECAY - HUB_PULSE_FADE_IN;
        if (decayLen <= 0) return 0;
        return Math.max(0, 1 - (t - HUB_PULSE_FADE_IN) / decayLen);
    }

    function hubPulseStrength(now, index) {
        var it = state && state.items && state.items[index];
        if (!it || it.hidden || !it._hubPulseStart) return 0;
        var start = it._hubPulseStart;
        var strength = hubPulseStrengthAt(now, start);
        if (now - start >= HUB_PULSE_DECAY) it._hubPulseStart = 0;
        return strength;
    }

    function isForegroundOrbit(index, now) {
        var it = state && state.items && state.items[index];
        if (!it || it.hidden) return false;
        var ang = state.reduced ? it.baseAngle : it.baseAngle + now * it.omega;
        return Math.sin(ang) >= 0;
    }

    /** Yellow hub-style highlight on a provider card (migration source/destination). */
    function pulseMigrationCard(index, now) {
        if (!state || !state.items || !state.items[index]) return;
        var it = state.items[index];
        if (it.hidden) return;
        it._hubPulseStart = now;
    }

    function clearMigrationCardPulse(index) {
        if (!state || !state.items || !state.items[index]) return;
        var it = state.items[index];
        it._hubPulseStart = 0;
        var card = state.cards && state.cards[index];
        if (!card) return;
        if (it._hubPulseOn) {
            card.classList.remove('provider-float--hub-pulse');
            card.style.removeProperty('--hub-pulse');
            it._hubPulseOn = false;
        }
    }

    function pickHubPulseIndices(visible, now) {
        var foreground = visible.filter(function (i) {
            return isForegroundOrbit(i, now);
        });
        var pool = foreground.length ? foreground : visible;
        var count = Math.min(pool.length, 1 + Math.floor(Math.random() * 2));
        pool = pool.slice();
        for (var j = pool.length - 1; j > 0; j--) {
            var k = Math.floor(Math.random() * (j + 1));
            var tmp = pool[j];
            pool[j] = pool[k];
            pool[k] = tmp;
        }
        return pool.slice(0, count);
    }

    function triggerHubPulse(now, indices) {
        for (var i = 0; i < indices.length; i++) {
            state.items[indices[i]]._hubPulseStart = now;
        }
        state.hubPulse.metacloudStart = now;
    }

    function tickHubPulse(now) {
        if (!state || state.reduced || !shouldAnimate()) return;
        var pulse = state.hubPulse;
        if (!pulse) return;
        if (now < pulse.nextAt) return;

        var visible = [];
        state.items.forEach(function (it, i) {
            if (!it.hidden) visible.push(i);
        });
        if (!visible.length) return;

        triggerHubPulse(now, pickHubPulseIndices(visible, now));
        pulse.nextAt = now + HUB_PULSE_INTERVAL;
    }

    function applyCardHubPulse(card, it, pulse) {
        if (pulse > 0) {
            card.style.setProperty('--hub-pulse', pulse.toFixed(3));
            if (!it._hubPulseOn) {
                card.classList.add('provider-float--hub-pulse');
                it._hubPulseOn = true;
            }
        } else if (it._hubPulseOn) {
            card.classList.remove('provider-float--hub-pulse');
            card.style.removeProperty('--hub-pulse');
            it._hubPulseOn = false;
        }
    }

    function applyMetacloudHubPulse(now) {
        var el = state._metacloudEl || document.getElementById('hero-metacloud');
        if (!el || !state.hubPulse) return;
        state._metacloudEl = el;

        var start = state.hubPulse.metacloudStart;
        if (!start) {
            if (state._metacloudPulseOn) {
                el.classList.remove('hero-metacloud--hub-pulse');
                el.style.removeProperty('--hub-pulse');
                state._metacloudPulseOn = false;
            }
            return;
        }

        var wave = hubPulseStrengthAt(now, start);
        if (now - start >= HUB_PULSE_DECAY) {
            state.hubPulse.metacloudStart = 0;
            el.classList.remove('hero-metacloud--hub-pulse');
            el.style.removeProperty('--hub-pulse');
            state._metacloudPulseOn = false;
            return;
        }

        if (wave > 0) {
            el.style.setProperty('--hub-pulse', (wave * METACLOUD_PULSE_SCALE).toFixed(3));
            if (!state._metacloudPulseOn) {
                el.classList.add('hero-metacloud--hub-pulse');
                state._metacloudPulseOn = true;
            }
        }
    }

    /** Ellipse position with forced perspective: far arc (sin < 0) has reduced vertical reach. */
    function orbitXY(cx, cy, rH, rV, ang) {
        var sinRaw = Math.sin(ang);
        var sinV = sinRaw < 0 ? sinRaw * FAR_V_COMPRESS : sinRaw;
        return {
            x: cx + rH * Math.cos(ang),
            y: cy + rV * sinV
        };
    }

    /** Interpolate dash geometry by orbital depth (0 = far, 1 = near). */
    function lineDashStyle(near) {
        var t = Math.max(0, Math.min(1, near));
        var len = LINE_DASH_FAR.len + (LINE_DASH_NEAR.len - LINE_DASH_FAR.len) * t;
        var gap = LINE_DASH_FAR.gap + (LINE_DASH_NEAR.gap - LINE_DASH_FAR.gap) * t;
        var flowW = LINE_DASH_FAR.width + (LINE_DASH_NEAR.width - LINE_DASH_FAR.width) * t;
        var baseW = LINE_BASE_FAR + (LINE_BASE_NEAR - LINE_BASE_FAR) * t;
        return {
            dashArray: len.toFixed(2) + ' ' + gap.toFixed(2),
            period: len + gap,
            flowWidth: flowW.toFixed(2),
            baseWidth: baseW.toFixed(2)
        };
    }

    /** Blur ramps up on the far arc; none at the near side. */
    function farPerspectiveBlur(near) {
        var far = 1 - Math.max(0, Math.min(1, near));
        var max = IS_SAFARI ? FAR_BLUR_MAX_SAFARI : FAR_BLUR_MAX;
        return far * far * max;
    }

    function blurFilter(px) {
        return px < 0.05 ? 'none' : 'blur(' + px.toFixed(2) + 'px)';
    }

    function canUseParallax() {
        return window.matchMedia('(pointer: fine)').matches;
    }

    function orbitCenter(ring) {
        var f = PARALLAX_RING_FACTOR[ring] || 1;
        if (!state || !state.parallaxEnabled) {
            return { x: state.cx, y: state.cy };
        }
        return {
            x: state.cx + state.parallaxX * f,
            y: state.cy + state.parallaxY * f
        };
    }

    function applyHeadlineShift() {
        if (!state) return;
        var shiftY = (state.headlineShiftY || 0) + (state.scrollParallaxY || 0);
        var t = shiftY
            ? 'translate3d(0,' + shiftY.toFixed(1) + 'px,0)'
            : '';
        document.querySelectorAll('.hero-home__headline, .hero-home__cta').forEach(function (el) {
            if (el.style.transform !== t) {
                el.style.transform = t;
            }
        });
    }

    function applyOrbitScrollShift() {
        if (!state || !state.linkLayer) return;
        var y = state.scrollParallaxY || 0;
        var t = y
            ? 'translate3d(0,' + y.toFixed(1) + 'px,0)'
            : '';
        [state.providers, state.linkLayer, state.cardLayer].forEach(function (el) {
            if (el && el.style.transform !== t) {
                el.style.transform = t;
            }
        });
    }

    function computeScrollParallaxY(hero) {
        if (!hero) return 0;
        var scrollY = window.scrollY || window.pageYOffset || 0;
        var max = Math.min(hero.offsetHeight * 0.45, window.innerHeight * 0.55);
        return -Math.min(scrollY * SCROLL_PARALLAX_RATE, max);
    }

    function updateScrollParallax() {
        if (!state || !state._hero || prefersReducedMotion()) return false;
        var y = computeScrollParallaxY(state._hero);
        if (state.scrollParallaxY === y) return false;
        state.scrollParallaxY = y;
        applyHeadlineShift();
        applyOrbitScrollShift();
        if (state.items) {
            state.items.forEach(function (it) {
                it._path = undefined;
            });
        }
        return true;
    }

    function scrollParallaxNeedsFrame() {
        if (!state || !state._hero || prefersReducedMotion()) return false;
        var target = computeScrollParallaxY(state._hero);
        return Math.abs((state.scrollParallaxY || 0) - target) > 0.1;
    }

    function bindScrollParallax(hero) {
        if (!hero || prefersReducedMotion() || (state && state._scrollParallaxBound)) return;

        if (!state) {
            state = { _hero: hero, scrollParallaxY: 0, headlineShiftY: 0 };
        } else {
            state._hero = hero;
        }
        state.scrollParallaxY = state.scrollParallaxY || 0;

        function onScroll() {
            updateScrollParallax();
            updateLoop();
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        state._onScrollParallax = onScroll;
        state._scrollParallaxBound = true;
        updateScrollParallax();
    }

    function updateParallax() {
        if (!state || !state.parallaxEnabled) return;
        var lerp = PARALLAX_LERP;
        state.parallaxX += (state.pointerNX * PARALLAX_ORBIT_MAX - state.parallaxX) * lerp;
        state.parallaxY += (state.pointerNY * PARALLAX_ORBIT_MAX - state.parallaxY) * lerp;
        state.items.forEach(function (it) {
            it._path = undefined;
        });
    }

    function parallaxNeedsFrame() {
        if (!state || !state.parallaxEnabled) return false;
        return Math.abs(state.parallaxX) > 0.15
            || Math.abs(state.parallaxY) > 0.15
            || Math.abs(state.pointerNX) > 0.002
            || Math.abs(state.pointerNY) > 0.002;
    }

    function motionNeedsFrame() {
        return parallaxNeedsFrame() || scrollParallaxNeedsFrame();
    }

    function bindParallax(hero) {
        if (!hero || !state || state.reduced || !canUseParallax()) return;

        state.parallaxEnabled = true;
        state.pointerNX = 0;
        state.pointerNY = 0;
        state.parallaxX = 0;
        state.parallaxY = 0;
        state.headlineShiftY = 0;

        function onMove(e) {
            var r = hero.getBoundingClientRect();
            if (!r.width || !r.height) return;
            var nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
            var ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
            state.pointerNX = Math.max(-1, Math.min(1, nx));
            state.pointerNY = Math.max(-1, Math.min(1, ny));
            updateLoop();
        }

        function onLeave() {
            state.pointerNX = 0;
            state.pointerNY = 0;
            updateLoop();
        }

        hero.addEventListener('mousemove', onMove);
        hero.addEventListener('mouseleave', onLeave);
        state._parallaxHero = hero;
        state._onParallaxMove = onMove;
        state._onParallaxLeave = onLeave;
    }

    function measureSubtitleZone(base) {
        var el = document.querySelector('.hero-home .hero-subtitle');
        if (!el) return null;
        var r = el.getBoundingClientRect();
        return {
            left: r.left - base.left,
            top: r.top - base.top,
            right: r.right - base.left,
            bottom: r.bottom - base.top
        };
    }

    /** 0 outside zone; 1 at centre (smooth falloff within pad). */
    function zoneInfluence(x, y, zone, pad) {
        if (!zone) return 0;
        var dx = Math.max(zone.left - x, 0, x - zone.right);
        var dy = Math.max(zone.top - y, 0, y - zone.bottom);
        var d = Math.hypot(dx, dy);
        if (d >= pad) return 0;
        return 1 - d / pad;
    }

    /** 1 outside subtitle; fades toward SUBTITLE_MIN_OP inside/near the copy block. */
    var SUBTITLE_MIN_OP = 0.18;

    function subtitleFadeFactor(x, y, zone, pad) {
        var t = zoneInfluence(x, y, zone, pad);
        return 1 - t * (1 - SUBTITLE_MIN_OP);
    }

    function init() {
        var container = document.getElementById('hero-wow-placeholder');
        if (!container) return;
        if (isSmallPortraitViewport()) {
            resetHeroBlocks();
            return;
        }

        var wrap = container.closest('.hero-wow');

        var providers = document.createElement('div');
        providers.className = 'hero-providers';
        providers.setAttribute('aria-hidden', 'true');

        var glow = document.createElement('span');
        glow.className = 'hero-providers__glow';
        providers.appendChild(glow);

        var linkLayer = document.createElement('div');
        linkLayer.className = 'hero-links';
        linkLayer.setAttribute('aria-hidden', 'true');

        var svg = document.createElementNS(SVGNS, 'svg');
        svg.setAttribute('class', 'hero-link-svg');
        svg.setAttribute('preserveAspectRatio', 'none');
        linkLayer.appendChild(svg);

        // Cards live in their own layer above the CTAs; lines sit between
        // CTAs and cards so both render over the buttons but under the hub.
        var cardLayer = document.createElement('div');
        cardLayer.className = 'hero-cards';
        cardLayer.setAttribute('aria-hidden', 'true');

        var cards = [];
        var lines = [];
        var items = [];
        assignStartAngles(PROVIDERS);
        PROVIDERS.forEach(function (p, i) {
            var line = buildLine(p, i);
            svg.appendChild(line.base);
            svg.appendChild(line.flow);
            lines.push(line);

            var card = buildCard(p);
            cardLayer.appendChild(card);
            cards.push(card);

            items.push({
                ring: p.ring,
                kind: p.kind,
                name: p.name,
                accent: p.accent,
                baseAngle: p.startAngle,
                omega: RING_OMEGA[p.ring],
                scale: RING_SCALE[p.ring],
                op: RING_OP[p.ring],
                revealStart: 180 + i * 40,
                rH: 0,
                rV: 0
            });
        });

        var atomosIdx = -1;
        PROVIDERS.forEach(function (p, i) {
            if (p.name === 'AtomOS') atomosIdx = i;
        });

        var migrationPool = initMigrationPool(svg);

        container.innerHTML = '';
        container.appendChild(providers);
        var hero = container.closest('.hero') || wrap.parentNode;
        if (hero) {
            hero.appendChild(linkLayer);
            hero.appendChild(cardLayer);
        }

        // Enforce stacking: headline (10) > CTAs (5) > cards (3) > lines (2).
        var headline = document.querySelector('.hero-home__headline');
        var cta = document.querySelector('.hero-home__cta');
        if (headline) {
            headline.style.position = 'relative';
            headline.style.zIndex = '10';
        }
        if (cta) {
            cta.style.position = 'relative';
            cta.style.zIndex = '5';
        }
        linkLayer.style.zIndex = '2';
        cardLayer.style.zIndex = '3';

        var reduced = prefersReducedMotion();
        if (wrap) {
            wrap.classList.add('hero-wow--providers');
            if (reduced) wrap.classList.add('hero-wow--static');
            if (IS_SAFARI) wrap.classList.add('hero-wow--safari');
        }

        state = {
            providers: providers, linkLayer: linkLayer, cardLayer: cardLayer,
            svg: svg, cards: cards, lines: lines,
            items: items, cx: 0, cy: 0, W: 0, reduced: reduced,
            inView: true, docVisible: !document.hidden,
            running: false, rafId: null, lastFrame: 0,
            frameMs: IS_SAFARI ? FRAME_MS_SAFARI : FRAME_MS,
            roundPath: IS_SAFARI,
            _hero: hero, scrollParallaxY: 0, headlineShiftY: 0,
            hubPulse: reduced ? null : {
                nextAt: performance.now() + 900,
                metacloudStart: 0
            },
            atomosIdx: atomosIdx,
            migrationPool: migrationPool,
            migrations: [],
            migrationNextAt: performance.now() + 1400
        };

        layout();
        bindVisibility(hero || wrap);
        bindParallax(hero);
        bindScrollParallax(hero);

        var resizeTimer = null;
        window.addEventListener('resize', function () {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(layout, 120);
        });
        window.addEventListener('load', layout);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(layout);
        }
        document.addEventListener('componentsLoaded', layout);
        window.setTimeout(layout, 600);

        if (!reduced) {
            updateLoop();
        } else {
            renderCards(0);
            renderLines(0);
        }
    }

    function bindVisibility(target) {
        document.addEventListener('visibilitychange', function () {
            if (!state) return;
            state.docVisible = !document.hidden;
            updateLoop();
        });

        if (!target || !('IntersectionObserver' in window)) return;

        var io = new IntersectionObserver(function (entries) {
            if (!state) return;
            state.inView = entries[0].isIntersecting;
            updateLoop();
        }, { root: null, rootMargin: '80px 0px', threshold: 0 });

        io.observe(target);
    }

    function shouldAnimate() {
        return state && !state.reduced && state.inView && state.docVisible;
    }

    function shouldRenderFrame() {
        return shouldAnimate()
            || (state && state.inView && state.docVisible && motionNeedsFrame());
    }

    function updateLoop() {
        if (shouldRenderFrame()) startLoop();
        else stopLoop();
    }

    function startLoop() {
        if (!state || state.running) return;
        state.running = true;
        state.lastFrame = 0;
        state.rafId = window.requestAnimationFrame(frame);
    }

    function stopLoop() {
        if (!state) return;
        state.running = false;
        if (state.rafId) {
            window.cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }
    }

    function frame(now) {
        if (!shouldRenderFrame()) {
            stopLoop();
            return;
        }
        state.rafId = window.requestAnimationFrame(frame);
        updateParallax();
        updateScrollParallax();
        tickHubPulse(now);
        applyMetacloudHubPulse(now);
        tickMigrations(now);
        if (now - state.lastFrame < state.frameMs) return;
        state.lastFrame = now;
        renderCards(now);
        renderLines(now);
        renderMigrations(now);
    }

    function layout() {
        if (!state) return;
        var base = state.providers.getBoundingClientRect();
        var W = base.width;
        var H = base.height;
        if (!W || !H) return;

        var word = document.getElementById('hero-metacloud');
        var cx, cy;
        if (word) {
            // Keep the word locked to the vertical center of the page by
            // shifting the headline + CTA blocks together.
            var blocks = document.querySelectorAll('.hero-home__headline, .hero-home__cta');
            blocks.forEach(function (el) { el.style.transform = ''; });
            var nat = word.getBoundingClientRect();
            var deltaY = window.innerHeight / 2 - (nat.top + nat.height / 2);
            deltaY = Math.max(-160, Math.min(220, deltaY));
            state.headlineShiftY = deltaY;
            applyHeadlineShift();
            applyOrbitScrollShift();
            var r = word.getBoundingClientRect();
            cx = r.left - base.left + r.width / 2;
            cy = r.top - base.top + r.height / 2;
        } else {
            cx = W / 2;
            cy = H * 0.34;
        }
        state.cx = cx;
        state.cy = cy;
        state.W = W;
        state.subtitleZone = measureSubtitleZone(base);
        state.subtitleFadePad = Math.max(36, Math.min(72, W * 0.05));

        state.svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

        // Density + margins scale down on narrow screens so the orbit still fits.
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var compact = vw <= 992;
        var tiny = vw <= 560;
        var dim = Math.min(vw, vh);

        // Near arc = scale 1 (sharp); far arc zooms out toward perspMin.
        var perspMin = Math.max(0.48, 0.56 - (dim - 720) / 1400 * 0.06);
        if (compact) {
            perspMin = Math.max(0.52, perspMin);
        }
        state.perspMin = perspMin;
        state.perspMax = 1;

        // Pull orbits in on smaller viewports / hero areas so bottom cards
        // don't overlap the hero copy below the Metacloud word.
        var orbitV = Math.min(1, dim / 980, H / 900);
        var orbitH = Math.min(1, vw / 1350);
        state.orbitV = orbitV;
        state.orbitH = orbitH;

        var marginX = Math.max(20, Math.min(96, W * 0.08));
        var marginTop = Math.max(72, H * 0.12);
        var marginBottom = Math.max(48, H * 0.08);

        // Cap radii so full ellipses stay on screen without distorting the orbit.
        var maxH = Math.min(cx - marginX, W - marginX - cx);
        var maxV = Math.min(cy - marginTop, H - marginBottom - cy);

        state.items.forEach(function (it, idx) {
            var hidden = (it.ring === 2 && compact) || (it.ring >= 1 && tiny);
            it.hidden = hidden;
            var card = state.cards[idx];
            var line = state.lines[idx];
            card.style.display = hidden ? 'none' : '';
            line.base.style.display = hidden ? 'none' : '';
            line.flow.style.display = hidden ? 'none' : '';
            it.rH = Math.min(RING_H[it.ring] * W * orbitH, maxH);
            it.rV = Math.min(RING_V[it.ring] * H * orbitV, maxV);
            it._baseHalfW = it._baseHalfH = undefined;
            it._path = it._transform = it._opacity = it._z = it._lineOp = it._lineDash = it._lineDashOff = it._near = it._farBlur = undefined;
        });

        state.items.forEach(function (it, idx) {
            if (it.hidden) return;
            var card = state.cards[idx];
            if (card.offsetWidth) {
                it._baseHalfW = card.offsetWidth * 0.5;
                it._baseHalfH = card.offsetHeight * 0.5;
            }
        });

        if (state.reduced) {
            renderCards(0);
            renderLines(0);
        } else if (shouldAnimate()) {
            var t = performance.now();
            renderCards(t);
            renderLines(t);
        }

        updateScrollParallax();
    }

    function renderCards(now) {
        var items = state.items;
        if (!items.length || !state.W) return;
        var pMin = state.perspMin != null ? state.perspMin : 0.52;
        var roundPos = state.roundPath;

        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (it.hidden) continue;

            var ang = state.reduced ? it.baseAngle : it.baseAngle + now * it.omega;
            var center = orbitCenter(it.ring);
            var pos = orbitXY(center.x, center.y, it.rH, it.rV, ang);
            var x = pos.x;
            var y = pos.y;
            if (roundPos) {
                x = Math.round(x);
                y = Math.round(y);
            }
            var near = (Math.sin(ang) + 1) / 2;
            var scaleNum = cardPerspectiveScale(near, it.scale, pMin);
            var reveal = state.reduced ? 1 : Math.max(0, Math.min(1, (now - it.revealStart) / 500));
            var subFade = subtitleFadeFactor(x, y, state.subtitleZone, state.subtitleFadePad);
            var blur = blurFilter(farPerspectiveBlur(near));

            var scale = scaleNum.toFixed(3);
            var px = roundPos ? String(x) : x.toFixed(1);
            var py = roundPos ? String(y) : y.toFixed(1);
            var transform = 'translate3d(' + px + 'px,' + py + 'px,0) translate(-50%,-50%) scale(' + scale + ')';
            var card = state.cards[i];
            if (it._transform !== transform) {
                card.style.transform = transform;
                it._transform = transform;
            }

            var baseW = it._baseHalfW || 105;
            var baseH = it._baseHalfH || 36;
            it._halfW = baseW * scaleNum;
            it._halfH = baseH * scaleNum;

            var z = String(1 + Math.round(near * 9));
            if (it._z !== z) {
                card.style.zIndex = z;
                it._z = z;
            }

            var opacity = (it.op * reveal * subFade).toFixed(3);
            if (it._opacity !== opacity) {
                card.style.opacity = opacity;
                it._opacity = opacity;
            }

            if (it._farBlur !== blur) {
                card.style.filter = blur;
                it._farBlur = blur;
            }

            it._x = x;
            it._y = y;
            it._near = near;
            it._lineOpVal = 0.7 * reveal * subFade;
            it._hubPulse = hubPulseStrength(now, i);
            applyCardHubPulse(card, it, it._hubPulse);
        }
    }

    function applyLineStyles(now, it, line) {
        var near = it._near != null ? it._near : 0.5;
        var pulse = it._hubPulse || 0;
        var blur = blurFilter(farPerspectiveBlur(near));

        if (it._lineFarBlur !== blur) {
            line.flow.style.filter = blur;
            line.base.style.filter = blur;
            it._lineFarBlur = blur;
        }

        var stroke = pulse > 0 ? HUB_PULSE_COLOR : it.accent;
        if (it._lineStroke !== stroke) {
            line.flow.style.stroke = stroke;
            line.base.style.stroke = stroke;
            it._lineStroke = stroke;
        }

        var dash = lineDashStyle(near);
        var flowW = (parseFloat(dash.flowWidth) * (1 + pulse * 0.55)).toFixed(2);
        var baseW = (parseFloat(dash.baseWidth) * (1 + pulse * 0.9)).toFixed(2);
        var dashKey = dash.dashArray + '|' + flowW + '|' + baseW + '|' + pulse.toFixed(2);
        if (it._lineDash !== dashKey) {
            line.flow.style.strokeDasharray = dash.dashArray;
            line.flow.style.strokeWidth = flowW;
            line.base.style.strokeWidth = baseW;
            it._lineDash = dashKey;
            it._lineDashPeriod = dash.period;
        }

        if (!state.reduced && shouldAnimate() && !IS_SAFARI) {
            line.flow.style.animation = 'none';
            var period = it._lineDashPeriod || 11;
            var off = -((now % LINE_DASH_FLOW_MS) / LINE_DASH_FLOW_MS) * period;
            var offStr = state.roundPath
                ? String(Math.round(off))
                : off.toFixed(2);
            if (it._lineDashOff !== offStr) {
                line.flow.style.strokeDashoffset = offStr;
                it._lineDashOff = offStr;
            }
        } else if (it._lineDashOff !== '0') {
            line.flow.style.strokeDashoffset = '0';
            it._lineDashOff = '0';
        }

        var baseOp = it._lineOpVal != null ? it._lineOpVal : 0.7;
        var lineOp = Math.min(1, baseOp * (1 + pulse * 0.45)).toFixed(3);
        if (it._lineOp !== lineOp) {
            line.flow.style.opacity = lineOp;
            it._lineOp = lineOp;
        }

        if (pulse > 0.02) {
            var baseLineOp = (0.12 + pulse * 0.3).toFixed(3);
            if (it._lineBaseOp !== baseLineOp) {
                line.base.style.opacity = baseLineOp;
                it._lineBaseOp = baseLineOp;
            }
        } else if (it._lineBaseOp != null) {
            line.base.style.opacity = '';
            it._lineBaseOp = null;
        }
    }

    function renderLines(now) {
        var items = state.items;
        if (!items.length || !state.W) return;
        var hubX = state.cx;
        var hubY = state.cy;

        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (it.hidden) continue;

            var x = it._x;
            var y = it._y;
            if (x == null) {
                var ang = state.reduced ? it.baseAngle : it.baseAngle + now * it.omega;
                var center = orbitCenter(it.ring);
                var pos = orbitXY(center.x, center.y, it.rH, it.rV, ang);
                x = pos.x;
                y = pos.y;
                if (state.roundPath) {
                    x = Math.round(x);
                    y = Math.round(y);
                }
            }

            var edge = rectEdgeToward(x, y, hubX, hubY, it._halfW || 70, it._halfH || 22);
            var ex = edge.x;
            var ey = edge.y;
            if (state.roundPath) {
                ex = Math.round(ex);
                ey = Math.round(ey);
            }

            var d = archPath(ex, ey, hubX, hubY, state.roundPath);
            var line = state.lines[i];
            if (it._path !== d) {
                line.base.setAttribute('d', d);
                line.flow.setAttribute('d', d);
                it._path = d;
            }

            applyLineStyles(now, it, line);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
