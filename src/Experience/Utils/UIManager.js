export default class UIManager {
  updateCardsPopup(requiredItems, itemsInfo, position, previousTower, experience,
    callback
  ) {
    const itemsContainer = document.querySelector('.card-container');
    if (!itemsContainer) return;

    // Clear old cards first
    itemsContainer.innerHTML = '';

    requiredItems.forEach((itemKey, index) => {
      const itemInfo = itemsInfo[itemKey];
      if (!itemInfo) return;

      // Build card element
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-tilt', '');
      card.setAttribute('data-tilt-max', '10');
      card.setAttribute('data-tilt-speed', '400');
      card.setAttribute('data-tilt-perspective', '1000');
      card.setAttribute('data-tilt-glare', '');
      card.setAttribute('data-tilt-max-glare', '0.2');

      card.innerHTML = `
              <div class="card-left">
                <img src="${itemInfo.image}" class="card-image" alt="${itemInfo.title}" />
              </div>
              <div class="card-right">
                <h2 class="card-title">${itemInfo.title}</h2>
                <p class="card-price"><span class="currency">$</span>${itemInfo.price}</p>
                <p class="card-description">${itemInfo.description}</p>
                <ul class="features-list">
                  ${itemInfo.features.map(f => `
                    <li>
                      <svg class="rotating-disc-svg" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="8" />
                      </svg>
                      ${f}
                    </li>
                  `).join('')}
                </ul>
                <button class="cta-button">Build ${itemInfo.title}</button>
              </div>
            `;

      itemsContainer.appendChild(card);
      const button = document.querySelectorAll('.cta-button')
      button[index].addEventListener('click', () => {
        experience.world.mapGenerator.setupTower(position, previousTower, itemKey)
        itemsContainer.style.display = 'none';
        itemsContainer.innerHTML = '';
        callback()
      })
    });

    // Show container after filling
    itemsContainer.style.display = requiredItems.length ? 'grid' : 'none';
  }
}
