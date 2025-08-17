document.addEventListener('DOMContentLoaded', () => {

    // --- ANIMAÇÃO DE SCROLL ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.property-card, .condo-info-box, .condition-card, .rules-box').forEach(section => {
        section.classList.add('fade-in-section');
        observer.observe(section);
    });

    // --- LÓGICA PRINCIPAL ---
    const fetchData = async () => {
        try {
            const response = await fetch('imoveis.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            renderContent(data);
        } catch (error) {
            console.error('Erro fatal ao carregar dados:', error);
        }
    };

    const renderContent = (data) => {
        renderCondoSection(data.condominium, data.properties);
        renderOtherSection(data.properties);
    };

    // --- RENDERIZAÇÃO DA SEÇÃO DO CONDOMÍNIO ---
    const renderCondoSection = (condo, properties) => {
        const condoProperties = properties.filter(p => p.isCondominiumProperty && p.available);
        if (condoProperties.length === 0) return;

        document.getElementById('condo-listings-section').style.display = 'block';
        document.getElementById('condo-name').textContent = condo.name;
        document.getElementById('condo-description').textContent = condo.description;
        document.getElementById('condo-address').textContent = condo.address;
        document.getElementById('condo-map-wrapper').innerHTML = `<iframe src="${condo.mapEmbedUrl}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
        document.getElementById('condo-rules').textContent = condo.rules;

        const amenitiesList = document.getElementById('condo-amenities-list');
        amenitiesList.innerHTML = condo.amenities.map(item => `<li>${item}</li>`).join('');

        if (condo.commonAreaVideoUrl) {
            const videoContainer = document.getElementById('condo-video-container');
            videoContainer.innerHTML = createVideoPlayer(condo.commonAreaVideoUrl, true);
        }

        const listingsContainer = document.getElementById('condo-property-listings');
        condoProperties.forEach(prop => listingsContainer.appendChild(createPropertyCard(prop)));
    };

    // --- RENDERIZAÇÃO DA SEÇÃO DE OUTRAS CASAS ---
    const renderOtherSection = (properties) => {
        const otherProperties = properties.filter(p => !p.isCondominiumProperty && p.available);
        if (otherProperties.length === 0) return;

        document.getElementById('other-listings-section').style.display = 'block';
        const listingsContainer = document.getElementById('other-property-listings');
        otherProperties.forEach(prop => listingsContainer.appendChild(createPropertyCard(prop, true)));
    };

    // --- CRIAÇÃO DOS ELEMENTOS ---
    const createPropertyCard = (property, showMap = false) => {
        const card = document.createElement('article');
        card.className = 'property-card fade-in-section';
        observer.observe(card);

        const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price);
        const whatsappMessage = `Olá! Tenho interesse no imóvel \"${property.title}\" que vi no site.`;
        const whatsappLink = `https://wa.me/5511981246767?text=${encodeURIComponent(whatsappMessage)}`;

        card.innerHTML = `
            <div class="video-container">
                ${createVideoPlayer(property.videoUrl)}
            </div>
            <div class="property-details">
                <h3>${property.title}</h3>
                <p>${property.description}</p>
                <p class="property-price">${formattedPrice} / mês</p>
                <ul class="features-list">
                    ${property.features.map(f => `<li><i class="${f.icon}"></i> ${f.text}</li>`).join('')}
                </ul>
                ${showMap && property.mapEmbedUrl ? `<div class="map-wrapper" style="margin-top: 1rem;"><iframe src="${property.mapEmbedUrl}" loading="lazy"></iframe></div>` : ''}
                <a href="${whatsappLink}" target="_blank" class="property-cta-button"><i class="fab fa-whatsapp"></i> Tenho Interesse</a>
            </div>
        `;
        return card;
    };

    const createVideoPlayer = (videoUrl, isMuted = false) => {
        if (!videoUrl) return ''; // Retorna string vazia se não houver vídeo
        
        // Retornando vídeo com controles nativos do browser
        return `
            <video src="${videoUrl}" loop ${isMuted ? 'muted' : ''} playsinline controls></video>
        `;
    };

    // --- EVENT LISTENERS ---
    // Removido listener de overlay de vídeo para usar controles nativos

    fetchData();
});