const inputSearch = document.getElementById("input-search");
const container1 = document.getElementsByClassName("cryptos")[0];
const container2 = document.getElementsByClassName("cryptos-search")[0];
const h1Elem = document.getElementById("h1-top");

window.addEventListener('touchmove', () => {
  console.log('touch');
})

// Dates

function generateDateRange() {
  const dateRange = [];
  const currentDate = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    dateRange.push(formatDate(date));
  }

  return dateRange.reverse();
}

function formatDate(date) {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${month}-${day}`;
}

const dateRange = generateDateRange();

// Get Bitcoin Chart

const getBtcData = async () => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily"
    );
    const data = await response.json();
    const btcPriceArray = [];
    for (let i = 0; i < data.prices.length; i++) {
      btcPriceArray.push(Math.round(data.prices[i][1]));
    }
    return btcPriceArray;
  } catch (err) {
    console.log(err);
  }
};

getBtcData()
  .then((btcPriceArray) => {
    createChart(btcPriceArray);
  })
  .catch((err) => {
    console.log(err);
  });

let ctx = document.getElementById("chart").getContext("2d");
let chart;

function createChart(arr) {
  const historicalData = [
    { date: "", price: 0 },
    { date: "", price: 0 },
    { date: "", price: 0 },
    { date: "", price: 0 },
    { date: "", price: 0 },
    { date: "", price: 0 },
    { date: "", price: 0 },
  ];

  for (let i = 0; i < dateRange.length; i++) {
    historicalData[i].date = dateRange[i];
    historicalData[i].price = arr[i];
  }

  let labels = historicalData.map(function (item) {
    return item.date;
  });
  let data = historicalData.map(function (item) {
    return item.price;
  });

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  } else {
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "BTC price",
            data: data,
            borderColor: "#FFFFFF",
            borderWidth: 1,
            pointRadius: 2,
            color: "#FFFFFF",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: true,
            grid: {
              display: true,
            },
            ticks: {
              color: "#FFFFFF",
            },
          },
          y: {
            display: true,
            grid: {
              display: true,
            },
            ticks: {
              color: "#FFFFFF",
            },
          },
        },
      },
    });
  }
}

// Top 10 Cryptos

const get10Cryptos = () => {
  let top10Arr = [];
  let top10Str = "";

  const updateContent = (data) => {
    container1.innerHTML = ""; // Rimuovi il contenuto precedente

    for (let i = 0; i < data.length; i++) {
      if (data[i].id !== "staked-ether") {
        let div = document.createElement("div");
        div.className = "container";
        div.classList.add("crypto-container");
        // Aggiungi la classe "crypto-container-clickable"
        div.classList.add("crypto-container-clickable");
        div.setAttribute("data-symbol", data[i].symbol); // Imposta l'attributo "data-index" con l'indice della criptovaluta

        let h2 = document.createElement("h2");
        h2.innerText = data[i].id;

        let p = document.createElement("p");
        p.innerText = `Price: ${data[i].current_price.toFixed(2)} $`;

        let img = document.createElement("img");
        img.src = data[i].image;

        div.appendChild(h2);
        div.appendChild(img);
        div.appendChild(p);

        container1.appendChild(div);

        if (top10Arr.length < 10) {
          top10Arr.push(data[i].symbol);
        }
      }
    }
    top10Str = top10Arr.join(",");
  };

  const fetchData = async () => {
    await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=11&page=1&sparkline=false&locale=en"
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Errore di risposta dall'API.");
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        updateContent(data);
        getInfoFunc(top10Str);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getInfoFunc = async (slug) => {
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?slug=${slug}`;
    const apiKey = "236e5e33-15a7-44b0-8495-6a2d6ea13345";
    await axios
      .get(url, {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
        },
      })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error("Errore di risposta dall'API.");
        }
        const data = response.data;
        let cryptos = data.data;

        let previousDiv = null;
        let originalDescription = "";
        const handleClick = (event) => {
          console.log(event);
          const clickedDiv = event.target.closest(
            ".crypto-container-clickable"
          );
          if (clickedDiv) {
            const symbol = clickedDiv.getAttribute("data-symbol");
            const cryptoArr = Object.values(cryptos);
            h1Elem.scrollIntoView({ behavior: "smooth", block: "start" });

            for (let i = 0; i < cryptoArr.length; i++) {
              if (symbol === cryptoArr[i].symbol.toLowerCase()) {
                if (previousDiv && previousDiv !== clickedDiv) {
                  const originalParagraph = previousDiv.querySelector("p");
                  originalParagraph.innerText = originalDescription;
                  previousDiv.classList.remove("crypto-container-big");
                  previousDiv.classList.add("crypto-container");
                }

                if (previousDiv === clickedDiv) {
                  const originalParagraph = clickedDiv.querySelector("p");
                  originalParagraph.innerText = originalDescription;
                  clickedDiv.classList.remove("crypto-container-big");
                  clickedDiv.classList.add("crypto-container");
                  previousDiv = null;
                  originalDescription = "";
                } else {
                  const description = cryptoArr[i].description;
                  const paragraph = clickedDiv.querySelector("p");
                  originalDescription = paragraph.innerText;
                  paragraph.innerText = description;
                  clickedDiv.classList.add("crypto-container-big");
                  clickedDiv.classList.remove("crypto-container");
                  previousDiv = clickedDiv;
                }
              }
            }
          }
        };

        for (let i = 0; i < 10; i++) {
          container1.children[i].children[1].addEventListener("touchstart", handleClick);
          container1.children[i].addEventListener("click", handleClick);
          // console.log(container1.children[i]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const cacheKey = "cachedCryptos";
  const cachedData = localStorage.getItem(cacheKey);
  const myParsedData = JSON.parse(cachedData);

  if (cachedData) {
    for (let i = 0; i < myParsedData.length; i++) {
      if (top10Arr.length < 10 && myParsedData[i].id !== "staked-ether") {
        if (myParsedData[i].id === "binancecoin") {
          myParsedData[i].id = "bnb";
        }
        top10Arr.push(myParsedData[i].id);
      }
    }

    try {
      updateContent(myParsedData);
    } catch (error) {
      console.log("Errore durante il parsing dei dati dalla cache.");
    }
  } else {
    fetchData();
  }

  fetchData(); // Effettua la prima chiamata
  setInterval(fetchData, 120000); // Chiama fetchData() ogni minuto
};

// Input

let timeoutId;

function handleInput() {
  const inputValue = inputSearch.value;
  container2.innerHTML = ""; // Rimuovi il contenuto del container2
  if (inputValue) {
    searchCrypto(inputValue);
  }
}

inputSearch.addEventListener("input", function (event) {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(handleInput, 1000);
});

// Crypto Search

const searchCrypto = async (value) => {
  await fetch(`https://api.coingecko.com/api/v3/search?query=${value}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.coins) {
        const filteredCoins = data.coins.slice(0, 10);

        for (let i = 0; i < filteredCoins.length; i++) {
          let div = document.createElement("div");
          div.className = "container";
          div.classList.add("crypto-container");

          let h2 = document.createElement("h2");
          h2.innerText = filteredCoins[i].name;

          let p = document.createElement("p");
          p.innerText = `Market Cap Rank: ${filteredCoins[i].market_cap_rank}`;

          let img = document.createElement("img");
          img.src = filteredCoins[i].large;

          div.appendChild(h2);
          div.appendChild(img);
          div.appendChild(p);

          container2.appendChild(div);
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

window.onload = () => {
  get10Cryptos();
};
