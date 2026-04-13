let units = document.querySelector("header .units"),
  listUnits = document.querySelector(".info__units"),
  toDay = document.querySelector(".content .hourly__title button"),
  toDaySpan = document.querySelector(".content .hourly__title button span"),
  toDayList = document.querySelectorAll(
    ".content .hourly__title button ul.days li",
  ),
  listDays = document.querySelector("ul.days");

let content = document.querySelector(".home .content");

let search = document.querySelector(".submit"),
  input = document.querySelector(".input input"),
  listContry = document.querySelector(".list__contry");

let hourlyImage = document.querySelectorAll(".content .hourly__info li img"),
  hourlyHour = document.querySelectorAll(".content .hourly__info li .hour"),
  hourlyCelsius = document.querySelectorAll(
    ".content .hourly__info li .celsius",
  );

let boxs = document.querySelectorAll(".content .wither__info .box > span");
let card = document.querySelectorAll(".content .daily__cards .card"),
  cardsh4 = document.querySelectorAll(".content .daily__cards .card h4"),
  cardsImage = document.querySelectorAll(".content .daily__cards .card img"),
  cardsSpanMax = document.querySelectorAll(
    ".content .daily__cards .card .spans span:first-of-type",
  ),
  cardsSpanMin = document.querySelectorAll(
    ".content .daily__cards .card .spans span:last-of-type",
  );

let now = new Date();
let getDay = now.getDay(); // رقم اليوم (0-6)
// let getDay = 0; // رقم اليوم (0-6)
let getHour = now.getHours(); // الساعة
let getMonth = now.getMonth();

let days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

let month = [
  "January ",
  "February",
  "March",
  "April ",
  "May ",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let lastTemperature = [];
let lastWeatherCode = [];

let currentUnit = {temp: "C", wind: "kmh", precip: "mm"};
let lastRawData = {}; // هيحفظ البيانات الخام

let selectedIndex = -1;

// console.log(hourlyImage);

content.style.display = "none";
document.querySelector(".loading").style.display = "flex";
document.querySelector(".not-found").style.display = "none";

// Functions

// Show List //
function showList(e) {
  e.stopPropagation();
  this.classList.toggle("active");
}

function searchCity() {
  if (input.value === "") {
    document.querySelector(".loading").style.display = "none";
    content.style.display = "none";
    document.querySelector(".not-found").style.display = "block";
  } else {
    setTimeout(() => {
      document.querySelector(".loading").style.display = "none";
      content.style.display = "flex";
    }, 200);
    document.querySelector(".not-found").style.display = "none";

    cities();
  }
}

function cities() {
  fetch("../egypt.json")
    .then((cont) => cont.json())
    .then((cont) => {
      listContry.innerHTML = "";
      selectedIndex = -1;

      for (let i = 0; i < cont.length; i++) {
        let lis = document.createElement("li"),
          liText = document.createTextNode(
            `${cont[i]["name_en"]},  ${cont[i]["name_ar"]}`,
          );
        lis.setAttribute("data-cont", cont[i]["name_en"]);

        listContry.append(lis);
        lis.append(liText);

        lis.addEventListener("click", fullInput);

        if (input.value === cont[i]["name_en"]) {
          let latitude = cont[i]["latitude"];
          let longitude = cont[i]["longitude"];

          document.querySelector(
            ".content .left .wither .country h3",
          ).textContent = `Egypt, ${cont[i]["name_en"]}`;

          result(cont[i]["latitude"], cont[i]["longitude"]);
        }
      }
    });
}

cities();

function fullInput() {
  input.value = this.dataset.cont;
}

function result(latitude, longitude) {
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,rain,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`,
  )
    .then((res) => res.json())
    .then((res) => {
      let daysTemperature = slices(res.hourly.temperature_2m);
      let daysApparent = slices(res.hourly.apparent_temperature);
      let daysRelative = slices(res.hourly.relative_humidity_2m);
      let daysWind = slices(res.hourly.wind_speed_10m);
      let daysRain = slices(res.hourly.rain);
      let daysWeatherCode = slices(res.hourly.weather_code);

      lastTemperature = daysTemperature;
      lastWeatherCode = daysWeatherCode;

      // console.log(Math.max(...daysTemperature[0]));

      // Left //
      document.querySelector(".content .left .wither .country p").innerHTML =
        `${days[getDay]}, ${month[getMonth].slice(0, 3)} ${now.getDate()}, ${now.getFullYear()}`;

      let currentTemp = daysTemperature[getDay][getHour];
      let currentAppa = daysApparent[getDay][getHour];
      let currentRela = daysRelative[getDay][getHour];
      let currentWind = daysWind[getDay][getHour];
      let currentRain = daysRain[getDay][getHour];
      let currentCode = daysWeatherCode[getDay][getHour];

      lastRawData = {
        temp: currentTemp,
        apparent: currentAppa,
        humidity: currentRela,
        wind: currentWind,
        rain: currentRain,
      };

      // console.log(daysWeatherCode[]);

      document.querySelector("span.degree").innerHTML =
        `${Math.trunc(currentTemp)}°`;
      boxs[0].innerHTML = `${Math.round(currentAppa)}°`;
      boxs[1].innerHTML = `${currentRela} %`;
      boxs[2].innerHTML = `${Math.round(currentWind)} Km/h`;
      boxs[3].innerHTML = `${currentRain} mm`;
      document.querySelector(".wither__icon").src = getIcon(
        currentCode,
        getHour > 17 || getHour < 5 ? true : false,
      );

      for (let i = 0; i < 7; i++) {
        cardsh4[i].innerHTML = `${days[i].slice(0, 3)}`;
      }

      for (let i = 0; i < 7; i++) {
        cardsImage[i].src = getIcon(daysWeatherCode[i][getHour]);
      }

      for (let i = 0; i < 7; i++) {
        cardsSpanMax[i].innerHTML =
          `${Math.round(Math.max(...daysTemperature[i]))}°`;
      }

      for (let i = 0; i < 7; i++) {
        cardsSpanMin[i].innerHTML =
          `${Math.round(Math.min(...daysTemperature[i]))}°`;
      }

      card[getDay].style.opacity = "1";

      // Right //

      toDaySpan.innerHTML = days[getDay];
      for (let i = 0; i < 7; i++) {
        toDayList[i].innerHTML = days[i];
      }

      toDayList.forEach((li) => {
        if (li.innerHTML === days[getDay]) {
          li.classList.add("active");
          rightList(daysWeatherCode[getDay], daysTemperature[getDay]);
        } else {
          li.classList.remove("active");
        }
      });
    })
    .catch((err) => {
      document.querySelector(".not-found").style.display = "block";
      content.style.display = "none";
    });
}

function slices(arr) {
  let result = [];
  for (let i = 0; i < 168; i += 24) {
    result.push(arr.slice(i, i + 24));
  }
  return result;
}

function getIcon(code, night) {
  if (code === 0 && night === false) return `../assets/images/icon-sunny.webp`;
  if (code === 0 && night === true) return `../assets/images/night-moon.PNG`;
  if (code <= 3 && night === false)
    return `../assets/images/icon-partly-cloudy.webp`;
  if (code <= 3 && night === true) return `../assets/images/crescent-moon.PNG`;
  if (code === 45 || code === 48) return `../assets/images/icon-fog.webp`;
  if (code <= 55) return `../assets/images/icon-drizzle.webp`;
  if (code <= 65) return `../assets/images/icon-rain.webp`;
  if (code <= 75) return `../assets/images/icon-snow.webp`;
  if (code <= 95) return `../assets/images/icon-storm.webp`;

  return `../assets/images/icon-overcast.webp`;
}

function activLi() {
  toDayList.forEach((li) => {
    li.classList.remove("active");
  });
  this.classList.add("active");
  toDaySpan.innerHTML = this.innerHTML;

  // هنجيب index اليوم المختار من array الأيام
  let selectedDayIndex = days.indexOf(this.innerHTML);

  // هنستدعي rightList بالبيانات الخاصة باليوم ده
  if (selectedDayIndex !== -1) {
    rightList(
      lastWeatherCode[selectedDayIndex],
      lastTemperature[selectedDayIndex],
    );
  }
}

function rightList(WeatherCode, daysTemperature) {
  for (let i = 0; i < 24; i++) {
    hourlyImage[i].src = getIcon(
      WeatherCode[i],
      i > 17 || i < 5 ? true : false,
    );
  }

  for (let i = 0; i < 24; i++) {
    let hour = i % 12 || 12;
    hourlyHour[i].innerHTML = `${hour} ${i < 12 ? "AM" : "PM"}`;
    // if (getHour + i <= 23) {
    //   hourlyHour[getHour + i].parentElement.style.order = "-1";
    // }
    hourlyHour[getHour].parentElement.style.opacity = "1";
  }

  for (let i = 0; i < 24; i++) {
    hourlyCelsius[i].innerHTML = `${Math.round(daysTemperature[i])}°`;
  }
}

function updateUnitsDisplay() {
  if (Object.keys(lastRawData).length === 0) return;

  let temp =
    currentUnit.temp === "C"
      ? Math.trunc(lastRawData.temp)
      : Math.trunc((lastRawData.temp * 9) / 5 + 32);

  let appa =
    currentUnit.temp === "C"
      ? Math.round(lastRawData.apparent)
      : Math.round((lastRawData.apparent * 9) / 5 + 32);

  let wind =
    currentUnit.wind === "kmh"
      ? Math.round(lastRawData.wind)
      : Math.round(lastRawData.wind * 0.621371);

  let rain =
    currentUnit.precip === "mm"
      ? lastRawData.rain
      : (lastRawData.rain * 0.0393701).toFixed(2);

  let tempUnit = currentUnit.temp === "C" ? "°" : "°F";
  let windUnit = currentUnit.wind === "kmh" ? " Km/h" : " mph";
  let rainUnit = currentUnit.precip === "mm" ? " mm" : " in";

  document.querySelector("span.degree").innerHTML = `${temp}${tempUnit}`;
  boxs[0].innerHTML = `${appa}${tempUnit}`;
  boxs[1].innerHTML = `${lastRawData.humidity} %`;
  boxs[2].innerHTML = `${wind}${windUnit}`;
  boxs[3].innerHTML = `${rain}${rainUnit}`;
}

// Temperature buttons
document.querySelectorAll(".unit:nth-of-type(1) button").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".unit:nth-of-type(1) button")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    currentUnit.temp = this.textContent.includes("Celsius") ? "C" : "F";
    updateUnitsDisplay();
  });
});

// Wind Speed buttons
document.querySelectorAll(".unit:nth-of-type(2) button").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".unit:nth-of-type(2) button")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    currentUnit.wind = this.textContent.includes("km/h") ? "kmh" : "mph";
    updateUnitsDisplay();
  });
});

// Precipitation buttons
document.querySelectorAll(".unit:nth-of-type(3) button").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".unit:nth-of-type(3) button")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    currentUnit.precip = this.textContent.includes("Millimeters") ? "mm" : "in";
    updateUnitsDisplay();
  });
});

// Events
units.addEventListener("click", showList);

toDay.addEventListener("click", showList);

document.addEventListener("click", function () {
  units.classList.remove("active");
  toDay.classList.remove("active");
});

search.addEventListener("click", searchCity);

toDayList.forEach((li) => {
  li.addEventListener("click", activLi);
});

document
  .querySelector(".info__units > button")
  .addEventListener("click", function () {
    let isImperial = this.textContent.includes("Imperial");

    if (isImperial) {
      currentUnit = {temp: "F", wind: "mph", precip: "in"};
      this.textContent = "Switch to Metric";
      // active state للـ buttons
      document
        .querySelectorAll(".unit:nth-of-type(1) button")[1]
        .classList.add("active");
      document
        .querySelectorAll(".unit:nth-of-type(1) button")[0]
        .classList.remove("active");
      document
        .querySelectorAll(".unit:nth-of-type(2) button")[1]
        .classList.add("active");
      document
        .querySelectorAll(".unit:nth-of-type(2) button")[0]
        .classList.remove("active");
      document
        .querySelectorAll(".unit:nth-of-type(3) button")[1]
        .classList.add("active");
      document
        .querySelectorAll(".unit:nth-of-type(3) button")[0]
        .classList.remove("active");
    } else {
      currentUnit = {temp: "C", wind: "kmh", precip: "mm"};
      this.textContent = "Switch to Imperial";
      document
        .querySelectorAll(".unit:nth-of-type(1) button")[0]
        .classList.add("active");
      document
        .querySelectorAll(".unit:nth-of-type(1) button")[1]
        .classList.remove("active");
      document
        .querySelectorAll(".unit:nth-of-type(2) button")[0]
        .classList.add("active");
      document
        .querySelectorAll(".unit:nth-of-type(2) button")[1]
        .classList.remove("active");
      document
        .querySelectorAll(".unit:nth-of-type(3) button")[0]
        .classList.add("active");
      document
        .querySelectorAll(".unit:nth-of-type(3) button")[1]
        .classList.remove("active");
    }

    updateUnitsDisplay();
  });

input.focus();

input.addEventListener("keydown", function (e) {
  let items = listContry.querySelectorAll("li");
  if (items.length === 0) return;

  if (e.key === "ArrowDown") {
    selectedIndex = (selectedIndex + 1) % items.length;
  } else if (e.key === "ArrowUp") {
    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
  } else if (e.key === "Enter") {
    search.click();
    if (selectedIndex >= 0) items[selectedIndex].click();
    input.blur();
    return;
  } else {
    return;
  }

  items.forEach((li) => li.classList.remove("active"));
  items[selectedIndex].classList.add("active");
  input.value = items[selectedIndex].dataset.cont;
  items[selectedIndex].scrollIntoView({block: "nearest"});
});

document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowDown" && document.activeElement !== input) {
    input.focus();
  }
});

input.addEventListener("input", cities); // يعرض النتايج وهو بيكتب
