NUMERO 1
/* From Uiverse.io by Smit-Prajapati */ 
.parent {
  width: 290px;
  height: 300px;
  perspective: 1000px;
}

.card {
  height: 100%;
  border-radius: 50px;
  background: linear-gradient(135deg, rgb(0, 255, 214) 0%, rgb(8, 226, 96) 100%);
  transition: all 0.5s ease-in-out;
  transform-style: preserve-3d;
  box-shadow: rgba(5, 71, 17, 0) 40px 50px 25px -40px, rgba(5, 71, 17, 0.2) 0px 25px 25px -5px;
}

.glass {
  transform-style: preserve-3d;
  position: absolute;
  inset: 8px;
  border-radius: 55px;
  border-top-right-radius: 100%;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.349) 0%, rgba(255, 255, 255, 0.815) 100%);
  /* -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px); */
  transform: translate3d(0px, 0px, 25px);
  border-left: 1px solid white;
  border-bottom: 1px solid white;
  transition: all 0.5s ease-in-out;
}

.content {
  padding: 100px 60px 0px 30px;
  transform: translate3d(0, 0, 26px);
}

.content .title {
  display: block;
  color: #00894d;
  font-weight: 900;
  font-size: 20px;
}

.content .text {
  display: block;
  color: rgba(0, 137, 78, 0.7647058824);
  font-size: 15px;
  margin-top: 20px;
}

.bottom {
  padding: 10px 12px;
  transform-style: preserve-3d;
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transform: translate3d(0, 0, 26px);
}

.bottom .view-more {
  display: flex;
  align-items: center;
  width: 40%;
  justify-content: flex-end;
  transition: all 0.2s ease-in-out;
}

.bottom .view-more:hover {
  transform: translate3d(0, 0, 10px);
}

.bottom .view-more .view-more-button {
  background: none;
  border: none;
  color: #00c37b;
  font-weight: bolder;
  font-size: 12px;
}

.bottom .view-more .svg {
  fill: none;
  stroke: #00c37b;
  stroke-width: 3px;
  max-height: 15px;
}

.bottom .social-buttons-container {
  display: flex;
  gap: 10px;
  transform-style: preserve-3d;
}

.bottom .social-buttons-container .social-button {
  width: 30px;
  aspect-ratio: 1;
  padding: 5px;
  background: rgb(255, 255, 255);
  border-radius: 50%;
  border: none;
  display: grid;
  place-content: center;
  box-shadow: rgba(5, 71, 17, 0.5) 0px 7px 5px -5px;
}

.bottom .social-buttons-container .social-button:first-child {
  transition: transform 0.2s ease-in-out 0.4s, box-shadow 0.2s ease-in-out 0.4s;
}

.bottom .social-buttons-container .social-button:nth-child(2) {
  transition: transform 0.2s ease-in-out 0.6s, box-shadow 0.2s ease-in-out 0.6s;
}

.bottom .social-buttons-container .social-button:nth-child(3) {
  transition: transform 0.2s ease-in-out 0.8s, box-shadow 0.2s ease-in-out 0.8s;
}

.bottom .social-buttons-container .social-button .svg {
  width: 15px;
  fill: #00894d;
}

.bottom .social-buttons-container .social-button:hover {
  background: black;
}

.bottom .social-buttons-container .social-button:hover .svg {
  fill: white;
}

.bottom .social-buttons-container .social-button:active {
  background: rgb(255, 234, 0);
}

.bottom .social-buttons-container .social-button:active .svg {
  fill: black;
}

.logo {
  position: absolute;
  right: 0;
  top: 0;
  transform-style: preserve-3d;
}

.logo .circle {
  display: block;
  position: absolute;
  aspect-ratio: 1;
  border-radius: 50%;
  top: 0;
  right: 0;
  box-shadow: rgba(100, 100, 111, 0.2) -10px 10px 20px 0px;
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  background: rgba(0, 249, 203, 0.2);
  transition: all 0.5s ease-in-out;
}

.logo .circle1 {
  width: 170px;
  transform: translate3d(0, 0, 20px);
  top: 8px;
  right: 8px;
}

.logo .circle2 {
  width: 140px;
  transform: translate3d(0, 0, 40px);
  top: 10px;
  right: 10px;
  -webkit-backdrop-filter: blur(1px);
  backdrop-filter: blur(1px);
  transition-delay: 0.4s;
}

.logo .circle3 {
  width: 110px;
  transform: translate3d(0, 0, 60px);
  top: 17px;
  right: 17px;
  transition-delay: 0.8s;
}

.logo .circle4 {
  width: 80px;
  transform: translate3d(0, 0, 80px);
  top: 23px;
  right: 23px;
  transition-delay: 1.2s;
}

.logo .circle5 {
  width: 50px;
  transform: translate3d(0, 0, 100px);
  top: 30px;
  right: 30px;
  display: grid;
  place-content: center;
  transition-delay: 1.6s;
}

.logo .circle5 .svg {
  width: 20px;
  fill: white;
}

.parent:hover .card {
  transform: rotate3d(1, 1, 0, 30deg);
  box-shadow: rgba(5, 71, 17, 0.3) 30px 50px 25px -40px, rgba(5, 71, 17, 0.1) 0px 25px 30px 0px;
}

.parent:hover .card .bottom .social-buttons-container .social-button {
  transform: translate3d(0, 0, 50px);
  box-shadow: rgba(5, 71, 17, 0.2) -5px 20px 10px 0px;
}

.parent:hover .card .logo .circle2 {
  transform: translate3d(0, 0, 60px);
}

.parent:hover .card .logo .circle3 {
  transform: translate3d(0, 0, 80px);
}

.parent:hover .card .logo .circle4 {
  transform: translate3d(0, 0, 100px);
}

.parent:hover .card .logo .circle5 {
  transform: translate3d(0, 0, 120px);
}

NUMERO 2

/* From Uiverse.io by Lakshay-art */ 
.grid {
  height: 800px;
  width: 800px;
  background-image: linear-gradient(to right, #0f0f10 1px, transparent 1px),
    linear-gradient(to bottom, #0f0f10 1px, transparent 1px);
  background-size: 1rem 1rem;
  background-position: center center;
  position: absolute;
  z-index: -1;
  filter: blur(1px);
}
.white,
.border,
.darkBorderBg,
.glow {
  max-height: 70px;
  max-width: 314px;
  height: 100%;
  width: 100%;
  position: absolute;
  overflow: hidden;
  z-index: -1;
  /* Border Radius */
  border-radius: 12px;
  filter: blur(3px);
}
.input {
  background-color: #010201;
  border: none;
  /* padding:7px; */
  width: 301px;
  height: 56px;
  border-radius: 10px;
  color: white;
  padding-inline: 59px;
  font-size: 18px;
}
#poda {
  display: flex;
  align-items: center;
  justify-content: center;
}
.input::placeholder {
  color: #c0b9c0;
}

.input:focus {
  outline: none;
}

#main:focus-within > #input-mask {
  display: none;
}

#input-mask {
  pointer-events: none;
  width: 100px;
  height: 20px;
  position: absolute;
  background: linear-gradient(90deg, transparent, black);
  top: 18px;
  left: 70px;
}
#pink-mask {
  pointer-events: none;
  width: 30px;
  height: 20px;
  position: absolute;
  background: #cf30aa;
  top: 10px;
  left: 5px;
  filter: blur(20px);
  opacity: 0.8;
  //animation:leftright 4s ease-in infinite;
  transition: all 2s;
}
#main:hover > #pink-mask {
  //animation: rotate 4s linear infinite;
  opacity: 0;
}

.white {
  max-height: 63px;
  max-width: 307px;
  border-radius: 10px;
  filter: blur(2px);
}

.white::before {
  content: "";
  z-index: -2;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(83deg);
  position: absolute;
  width: 600px;
  height: 600px;
  background-repeat: no-repeat;
  background-position: 0 0;
  filter: brightness(1.4);
  background-image: conic-gradient(
    rgba(0, 0, 0, 0) 0%,
    #a099d8,
    rgba(0, 0, 0, 0) 8%,
    rgba(0, 0, 0, 0) 50%,
    #dfa2da,
    rgba(0, 0, 0, 0) 58%
  );
  //  animation: rotate 4s linear infinite;
  transition: all 2s;
}
.border {
  max-height: 59px;
  max-width: 303px;
  border-radius: 11px;
  filter: blur(0.5px);
}
.border::before {
  content: "";
  z-index: -2;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(70deg);
  position: absolute;
  width: 600px;
  height: 600px;
  filter: brightness(1.3);
  background-repeat: no-repeat;
  background-position: 0 0;
  background-image: conic-gradient(
    #1c191c,
    #402fb5 5%,
    #1c191c 14%,
    #1c191c 50%,
    #cf30aa 60%,
    #1c191c 64%
  );
  // animation: rotate 4s 0.1s linear infinite;
  transition: all 2s;
}
.darkBorderBg {
  max-height: 65px;
  max-width: 312px;
}
.darkBorderBg::before {
  content: "";
  z-index: -2;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(82deg);
  position: absolute;
  width: 600px;
  height: 600px;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-image: conic-gradient(
    rgba(0, 0, 0, 0),
    #18116a,
    rgba(0, 0, 0, 0) 10%,
    rgba(0, 0, 0, 0) 50%,
    #6e1b60,
    rgba(0, 0, 0, 0) 60%
  );
  transition: all 2s;
}
#poda:hover > .darkBorderBg::before {
  transform: translate(-50%, -50%) rotate(262deg);
}
#poda:hover > .glow::before {
  transform: translate(-50%, -50%) rotate(240deg);
}
#poda:hover > .white::before {
  transform: translate(-50%, -50%) rotate(263deg);
}
#poda:hover > .border::before {
  transform: translate(-50%, -50%) rotate(250deg);
}

#poda:hover > .darkBorderBg::before {
  transform: translate(-50%, -50%) rotate(-98deg);
}
#poda:hover > .glow::before {
  transform: translate(-50%, -50%) rotate(-120deg);
}
#poda:hover > .white::before {
  transform: translate(-50%, -50%) rotate(-97deg);
}
#poda:hover > .border::before {
  transform: translate(-50%, -50%) rotate(-110deg);
}

#poda:focus-within > .darkBorderBg::before {
  transform: translate(-50%, -50%) rotate(442deg);
  transition: all 4s;
}
#poda:focus-within > .glow::before {
  transform: translate(-50%, -50%) rotate(420deg);
  transition: all 4s;
}
#poda:focus-within > .white::before {
  transform: translate(-50%, -50%) rotate(443deg);
  transition: all 4s;
}
#poda:focus-within > .border::before {
  transform: translate(-50%, -50%) rotate(430deg);
  transition: all 4s;
}

.glow {
  overflow: hidden;
  filter: blur(30px);
  opacity: 0.4;
  max-height: 130px;
  max-width: 354px;
}
.glow:before {
  content: "";
  z-index: -2;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(60deg);
  position: absolute;
  width: 999px;
  height: 999px;
  background-repeat: no-repeat;
  background-position: 0 0;
  /*border color, change middle color*/
  background-image: conic-gradient(
    #000,
    #402fb5 5%,
    #000 38%,
    #000 50%,
    #cf30aa 60%,
    #000 87%
  );
  /* change speed here */
  //animation: rotate 4s 0.3s linear infinite;
  transition: all 2s;
}

@keyframes rotate {
  100% {
    transform: translate(-50%, -50%) rotate(450deg);
  }
}
@keyframes leftright {
  0% {
    transform: translate(0px, 0px);
    opacity: 1;
  }

  49% {
    transform: translate(250px, 0px);
    opacity: 0;
  }
  80% {
    transform: translate(-40px, 0px);
    opacity: 0;
  }

  100% {
    transform: translate(0px, 0px);
    opacity: 1;
  }
}

#filter-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  max-height: 40px;
  max-width: 38px;
  height: 100%;
  width: 100%;

  isolation: isolate;
  overflow: hidden;
  /* Border Radius */
  border-radius: 10px;
  background: linear-gradient(180deg, #161329, black, #1d1b4b);
  border: 1px solid transparent;
}
.filterBorder {
  height: 42px;
  width: 40px;
  position: absolute;
  overflow: hidden;
  top: 7px;
  right: 7px;
  border-radius: 10px;
}

.filterBorder::before {
  content: "";

  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  position: absolute;
  width: 600px;
  height: 600px;
  background-repeat: no-repeat;
  background-position: 0 0;
  filter: brightness(1.35);
  background-image: conic-gradient(
    rgba(0, 0, 0, 0),
    #3d3a4f,
    rgba(0, 0, 0, 0) 50%,
    rgba(0, 0, 0, 0) 50%,
    #3d3a4f,
    rgba(0, 0, 0, 0) 100%
  );
  animation: rotate 4s linear infinite;
}
#main {
  position: relative;
}
#search-icon {
  position: absolute;
  left: 20px;
  top: 15px;
}


NUMERO 3

/* From Uiverse.io by kennyotsu */ 
.card {
  /* color used to softly clip top and bottom of the .words container */
  --bg-color: #111;
  background-color: var(--bg-color);
  padding: 1rem 2rem;
  border-radius: 1.25rem;
}
.loader {
  color: rgb(124, 124, 124);
  font-family: "Poppins", sans-serif;
  font-weight: 500;
  font-size: 25px;
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
  height: 40px;
  padding: 10px 10px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  border-radius: 8px;
}

.words {
  overflow: hidden;
  position: relative;
}
.words::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    var(--bg-color) 10%,
    transparent 30%,
    transparent 70%,
    var(--bg-color) 90%
  );
  z-index: 20;
}

.word {
  display: block;
  height: 100%;
  padding-left: 6px;
  color: #956afa;
  animation: spin_4991 4s infinite;
}

@keyframes spin_4991 {
  10% {
    -webkit-transform: translateY(-102%);
    transform: translateY(-102%);
  }

  25% {
    -webkit-transform: translateY(-100%);
    transform: translateY(-100%);
  }

  35% {
    -webkit-transform: translateY(-202%);
    transform: translateY(-202%);
  }

  50% {
    -webkit-transform: translateY(-200%);
    transform: translateY(-200%);
  }

  60% {
    -webkit-transform: translateY(-302%);
    transform: translateY(-302%);
  }

  75% {
    -webkit-transform: translateY(-300%);
    transform: translateY(-300%);
  }

  85% {
    -webkit-transform: translateY(-402%);
    transform: translateY(-402%);
  }

  100% {
    -webkit-transform: translateY(-400%);
    transform: translateY(-400%);
  }
}


NUMERO 4
/* From Uiverse.io by codebykay101 */ 
.container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container .glass {
  position: relative;
  width: 180px;
  height: 200px;
  background: linear-gradient(#fff2, transparent);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 25px rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.5s;
  border-radius: 10px;
  margin: 0 -45px;
  backdrop-filter: blur(10px);
  transform: rotate(calc(var(--r) * 1deg));
}

.container:hover .glass {
  transform: rotate(0deg);
  margin: 0 10px;
}

.container .glass::before {
  content: attr(data-text);
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}
.container .glass svg {
  font-size: 2.5em;
  fill: #fff;
}

NUMERO 4
/* From Uiverse.io by Nawsome */ 
.svg-frame {
  position: relative;
  width: 300px;
  height: 300px;
  transform-style: preserve-3d;
  display: flex;
  justify-content: center;
  align-items: center;
}

.svg-frame svg {
  position: absolute;
  transition: .5s;
  z-index: calc(1 - (0.2 * var(--j)));
  transform-origin: center;
  width: 344px;
  height: 344px;
  fill: none;
}

.svg-frame:hover svg {
  transform: rotate(-80deg) skew(30deg) translateX(calc(45px * var(--i))) translateY(calc(-35px * var(--i)));
}

.svg-frame svg #center {
  transition: .5s;
  transform-origin: center;
}

.svg-frame:hover svg #center {
  transform: rotate(-30deg) translateX(45px) translateY(-3px);
}

#out2 {
  animation: rotate16 7s ease-in-out infinite alternate;
  transform-origin: center;
}

#out3 {
  animation: rotate16 3s ease-in-out infinite alternate;
  transform-origin: center;
  stroke: #ff0;
}

#inner3,
#inner1 {
  animation: rotate16 4s ease-in-out infinite alternate;
  transform-origin: center;
}

#center1 {
  fill: #ff0;
  animation: rotate16 2s ease-in-out infinite alternate;
  transform-origin: center;
}

@keyframes rotate16 {
  to {
    transform: rotate(360deg);
  }
}