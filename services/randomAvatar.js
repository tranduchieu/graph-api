const randomUrl = () => {
  const url = [
    'http://i.imgur.com/dyMUlnk.jpg',
    'http://i.imgur.com/yFkQ7UQ.jpg',
    'http://i.imgur.com/4l0pgWA.jpg',
    'http://i.imgur.com/0slk2Rz.jpg',
    'http://i.imgur.com/Mv5nDDH.jpg',
    'http://i.imgur.com/k7PNE7u.jpg',
    'http://i.imgur.com/bvoPC1h.jpg',
    'http://i.imgur.com/ZQo6q8q.jpg',
    'http://i.imgur.com/D3OG2WW.jpg',
    'http://i.imgur.com/1gOgm6g.jpg',
    'http://i.imgur.com/geOqsfL.jpg',
    'http://i.imgur.com/jLqgAQn.jpg',
    'http://i.imgur.com/64QLTpI.jpg',
    'http://i.imgur.com/x8s8vKe.jpg',
    'http://i.imgur.com/V06XFu9.jpg',
    'http://i.imgur.com/FiZEZ2m.jpg',
  ];

  return url[getRandomInt(0, url.length - 1)];
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

export default randomUrl;
