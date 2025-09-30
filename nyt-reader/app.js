const API_KEY = 'GjoqxorwuHX7AszDMj7c0jCziP2vNW4m';
const articlesList = document.getElementById('articles-list');
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

async function fetchTopArticles() {
  const res = await fetch(`https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${API_KEY}`);
  const data = await res.json();
  displayArticles(data.results);
}

function displayArticles(articles) {
  articlesList.innerHTML = '';
  articles.forEach(article => {
    const li = document.createElement('li');
    li.innerHTML = `
      <a href="${article.url}" target="_blank">${article.title}</a>
      <p>${article.abstract}</p>
    `;
    articlesList.appendChild(li);
  });
}

async function searchArticles(query) {
  const res = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${query}&api-key=${API_KEY}`);
  const data = await res.json();
  displayArticles(data.response.docs.map(doc => ({
    title: doc.headline.main,
    abstract: doc.abstract,
    url: doc.web_url
  })));
}


searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if(query) searchArticles(query);
});


fetchTopArticles();


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker registrado!'));
}