const NYT_API_KEY = "GjoqxorwuHX7AszDMj7c0jCziP2vNW4m"; 

function initApp() {
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                console.log(`Latitude: ${lat}, Longitude: ${lon}`);

                
                const locationName = "Brasil"; 
                fetchNYTArticles(locationName);
            },
            (error) => {
                console.error("Erro na Geolocalização:", error);
                fetchNYTArticles("New York"); 
            }
        );
    } else {
        console.log("Geolocalização não suportada.");
        fetchNYTArticles("Londres");
    }

  
    const retryBtn = document.querySelector('.retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            initApp();
        });
    }
}

async function fetchNYTArticles(location) {
    showLoading(true);

    const query = encodeURIComponent(location);
    const url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=glocations:("${query}")&api-key=${NYT_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        renderResults(data.response?.docs || []);
    } catch (error) {
        console.error("Erro ao buscar artigos do NYT:", error);
        document.getElementById('results').innerHTML = "<p>Erro ao carregar artigos. Verifique sua conexão.</p>";
    } finally {
        showLoading(false);
    }
}

function showLoading(isLoading) {
    const loadingEl = document.querySelector('.loading-state');
    const resultsEl = document.getElementById('results');
    if (isLoading) {
        loadingEl.style.display = 'flex';
        resultsEl.style.display = 'none';
    } else {
        loadingEl.style.display = 'none';
        resultsEl.style.display = 'block'; 
    }
}

function renderResults(articles) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; 

    if (!articles || articles.length === 0) {
        resultsContainer.innerHTML = "<p>Nenhum artigo recente encontrado para esta localização.</p>";
        return;
    }
    
    articles.forEach(article => {
        const item = document.createElement('div');
        item.className = 'article-item';
        item.innerHTML = `
            <h3><a href="${article.web_url}" target="_blank" rel="noopener noreferrer">${article.headline.main}</a></h3>
            <p>${article.snippet || ''}</p>
            <small>Publicado: ${new Date(article.pub_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</small>
            <hr>
        `;
        resultsContainer.appendChild(item);
    });
}

window.onload = initApp;
