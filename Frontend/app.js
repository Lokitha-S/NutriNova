const items = document.querySelectorAll('.carousel .item');
const groupButtons = document.querySelectorAll('.group-btn');
const carousel = document.querySelector('.carousel');
let active = 0;

function changeSlider(index, originX, originY) {
  const isNext = index > active;
  carousel.classList.remove('next', 'prev');
  carousel.classList.add(isNext ? 'next' : 'prev');

  const clipX = originX + window.scrollX;
  const clipY = originY + window.scrollY;

  items.forEach(item => {
    item.style.setProperty('--clip-x', `${clipX}px`);
    item.style.setProperty('--clip-y', `${clipY}px`);
  });

  items[active].classList.remove('active');
  items[index].classList.add('active');

  groupButtons.forEach(btn => {
    btn.classList.remove('active');
    btn.style.removeProperty('--active-bg');
  });

  const bgColor = getComputedStyle(items[index].querySelector('.main-content')).backgroundColor;
  groupButtons[index].classList.add('active');
  groupButtons[index].style.setProperty('--active-bg', bgColor);

  active = index;
}

groupButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    const index = parseInt(button.dataset.index);
    if (index === active) return;

    const rect = button.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    changeSlider(index, originX, originY);
  });
});
