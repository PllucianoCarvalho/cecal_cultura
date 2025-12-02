(function () {
	'use strict';

	// Atualiza o ano no rodapé
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	/* TIMELINE: dados dos acontecimentos (pesquisados e validados com fontes obrigatórias) */
	const TIMELINE_DATA = {
		'1500': 'Chegada de Pedro Álvares Cabral ao Brasil inicia o contato europeu com indígenas, criando o cenário para a posterior chegada de africanos escravizados que influenciariam profundamente a cultura popular. A presença africana, a partir do século XVI, trouxe línguas, ritmos e crenças que se misturaram ao folclore brasileiro.',
		'1530': 'Início do tráfico em massa de africanos para o Nordeste, especialmente Bahia e Pernambuco, para trabalhar nos engenhos de açúcar. Os primeiros registros apontam para 1538 como o ano de chegada dos primeiros escravos na Bahia, trazidos de Guiné e Cabo Verde.',
		'1808': 'Transferência da corte portuguesa para o Rio de Janeiro intensifica o tráfico de escravos e favorece a formação de terreiros de candomblé, com síncretismo entre religiões africanas e catolicismo, base para manifestações culturais como o Candomblé.',
		'1888': 'Em 13 de maio de 1888, a Princesa Isabel assinou a Lei Áurea, que acabou com a escravidão no Brasil após mais de 300 anos de sofrimento para milhões de africanos e seus descendentes. Essa lei libertou cerca de 700 mil pessoas escravizadas, mas sem dar terras ou apoio para elas começarem uma nova vida. Sabia que o Brasil foi o último país das Américas a abolir a escravidão, só 21 anos antes de o mundo todo já ter parado com isso em outros lugares?',
		'1930': 'Samba ganha popularidade nacional com escolas como Mangueira e Portela, consolidando-se como expressão central da cultura popular de matriz africana, com raízes nos antigos batuques e cortejos.',
		'1960': 'Capoeira, antes reprimida, é reconhecida como esporte e patrimônio cultural, ganhando força como resistência durante a ditadura; candomblé e umbanda se fortalecem em centros urbanos.',
		'1988': 'Constituição Federal reconhece o direito à terra para remanescentes de quilombos e garante a liberdade religiosa, fortalecendo a preservação do patrimônio cultural afro-brasileiro.',
		'2000': 'Políticas públicas como o Inventário Nacional da Diversidade Linguística e o registro do samba de roda do Recôncavo Baiano como patrimônio imaterial reforçam a valorização das tradições afro-brasileiras.',
		'2010': 'Criação do Dia Nacional da Consciência Negra (20 de novembro) por lei federal e aumento de projetos de memória em museus e plataformas digitais ampliam a visibilidade do folclore afro-brasileiro.',
		'2020': 'Movimentos como o ENEGRECER e plataformas digitais como o Museu Afro Brasil amplificam vozes afro-brasileiras, promovendo festivais, lives e denúncias contra o apagamento cultural.',
		'2030': 'Projeção de continuidade das políticas de reparação histórica, com investimentos em educação, salvaguarda de terreiros e reconhecimento de novas expressões do patrimônio imaterial afro-brasileiro.'
	};

	// Timeline: comportamento interativo (otimizado para acessibilidade e UX)
	(function initTimeline() {
		const track = document.querySelector('.timeline-track');
		if (!track) return;
		const items = Array.from(track.querySelectorAll('.timeline-item'));
		const panelTitle = document.getElementById('timeline-title');
		const panelDesc = document.getElementById('timeline-desc');
		if (!panelTitle || !panelDesc || items.length === 0) return;

		// Centraliza item horizontalmente com precisão e evita scroll vertical
		function centerItemHorizontally(item) {
			const trackRect = track.getBoundingClientRect();
			const itemRect = item.getBoundingClientRect();
			const targetScroll = item.offsetLeft - (trackRect.width / 2) + (itemRect.width /  2);
			const maxScroll = track.scrollWidth - track.clientWidth;
			track.scrollTo({
				left: Math.max(0, Math.min(maxScroll, targetScroll)),
				behavior: 'smooth'
			});
		}

		// Garante que o conteúdo principal fique abaixo da navegação após interação
		function alignMainBelowNav() {
			const nav = document.querySelector('nav');
			const mainEl = document.getElementById('main');
			if (!nav || !mainEl) return;
			const navHeight = nav.offsetHeight;
			const currentScroll = window.scrollY;
			const mainTop = mainEl.offsetTop;
			if (currentScroll + navHeight > mainTop) {
				window.scrollTo({ top: mainTop - navHeight, behavior: 'smooth' });
			}
		}

		function showFor(item) {
			if (!item) return;
			const year = item.getAttribute('data-year');
			const title = item.getAttribute('data-title') || `Ano ${year}`;
			const desc = TIMELINE_DATA[year] || 'Informação não disponível.';
			
			panelTitle.textContent = `${year} — ${title}`;
			panelDesc.textContent = desc;

			// Atualiza estado ativo com ARIA
			items.forEach(i => {
				const isActive = i === item;
				i.classList.toggle('active', isActive);
				i.setAttribute('aria-pressed', isActive);
				i.setAttribute('aria-selected', isActive);
			});

			centerItemHorizontally(item);
			setTimeout(alignMainBelowNav, 300); // pequeno delay para animação
		}

		// Clique com foco controlado
		items.forEach(item => {
			item.addEventListener('click', e => {
				e.preventDefault();
				try { item.focus({ preventScroll: true }); } catch (_) { item.focus(); }
				showFor(item);
			});
		});

		// Navegação por teclado (acessibilidade completa)
		track.addEventListener('keydown', e => {
			const active = document.activeElement;
			if (!items.includes(active)) return;

			const idx = items.indexOf(active);
			let target;

			switch (e.key) {
				case 'ArrowRight':
				case 'ArrowDown':
					e.preventDefault();
					target = items[Math.min(items.length - 1, idx + 1)];
					break;
				case 'ArrowLeft':
				case 'ArrowUp':
					e.preventDefault();
					target = items[Math.max(0, idx - 1)];
					break;
				case 'Home':
					e.preventDefault();
					target = items[0];
					break;
				case 'End':
					e.preventDefault();
					target = items[items.length - 1];
					break;
				case 'Enter':
				case ' ':
					e.preventDefault();
					showFor(active);
					return;
				default:
					return;
			}

			if (target) {
				try { target.focus({ preventScroll: true }); } catch (_) { target.focus(); }
				showFor(target);
			}
		});

		// Ativa o primeiro item ao carregar
		if (items.length > 0) {
			setTimeout(() => showFor(items[0]), 500);
		}
	})();

	// Overlay: alternância PT ↔ Iorubá com acessibilidade e controle de animação
	(function initOverlay() {
		const overlay = document.querySelector('.header-overlay');
		if (!overlay) return;
		const pt = overlay.querySelector('.lang-pt');
		const yo = overlay.querySelector('.lang-yo');
		if (!pt || !yo) return;

		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let current = 0; // 0 = PT, 1 = YO
		let timer = null;

		function show(langIndex) {
			current = langIndex;
			[pt, yo].forEach((el, i) => {
				const isVisible = i === langIndex;
				el.classList.toggle('visible', isVisible);
				el.setAttribute('aria-hidden', !isVisible);
			});
		}

		function startAuto() {
			if (prefersReduced || timer) return;
			timer = setInterval(() => show(current === 0 ? 1 : 0), 3000);
		}

		function stopAuto() {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		}

		// Inicializa
		show(0);
		startAuto();

		// Interações manuais
		const toggleAndPause = () => {
			stopAuto();
			show(current === 0 ? 1 : 0);
		};

		overlay.addEventListener('click', toggleAndPause);
		overlay.addEventListener('keydown', e => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				toggleAndPause();
			}
		});

		overlay.addEventListener('mouseenter', stopAuto);
		overlay.addEventListener('mouseleave', startAuto);
	})();

	// Formulário: validação robusta e acessível
	(function initForm() {
		const form = document.getElementById('contactForm');
		if (!form) return;

		const inputs = {
			name: document.getElementById('name'),
			email: document.getElementById('email'),
			message: document.getElementById('message')
		};

		// Validação em tempo real
		Object.values(inputs).forEach(input => {
			if (!input) return;
			input.addEventListener('blur', () => {
				const value = input.value.trim();
				const isEmpty = value === '';
				input.setAttribute('aria-invalid', isEmpty);
				if (isEmpty) {
					input.nextElementSibling?.classList.add('error');
				} else {
					input.nextElementSibling?.classList.remove('error');
				}
			});
		});

		form.addEventListener('submit', e => {
			e.preventDefault();
			const name = inputs.name?.value.trim() || '';
			const email = inputs.email?.value.trim() || '';
			const message = inputs.message?.value.trim() || '';

			const isValid = name && email && message && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

			if (!isValid) {
				alert('Por favor, preencha todos os campos corretamente. Verifique seu e-mail.');
				return;
			}

			alert(`Obrigado, ${name}! Sua mensagem foi enviada com sucesso. (Simulação)`);
			form.reset();
			Object.values(inputs).forEach(input => {
				if (input) input.setAttribute('aria-invalid', 'false');
			});
		});
	})();

	// Script global para controlar o menu Games
	(function(){
		const btn = document.getElementById('games-button');
		const menu = document.getElementById('games-menu');
		if (!btn || !menu) return;
		function openMenu() {
			btn.setAttribute('aria-expanded','true');
			menu.setAttribute('aria-hidden','false');
		}
		function closeMenu() {
			btn.setAttribute('aria-expanded','false');
			menu.setAttribute('aria-hidden','true');
		}
		function toggleMenu() {
			if (menu.getAttribute('aria-hidden') === 'true') openMenu(); else closeMenu();
		}
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			toggleMenu();
		});
		document.addEventListener('click', (e) => {
			if (!menu.contains(e.target) && e.target !== btn) closeMenu();
		});
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') closeMenu();
			if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && menu.getAttribute('aria-hidden') === 'true') {
				openMenu();
				e.preventDefault();
			}
		});
		menu.addEventListener('focusout', (e) => {
			const newFocus = e.relatedTarget;
			if (!menu.contains(newFocus) && newFocus !== btn) closeMenu();
		});
	})();
})();