import "./App.css";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

function App() {
  const [data, setData] = useState(null);
  const [gData, setgData] = useState([]);
  const [active, setActive] = useState(null);

  const width = 400;
  const half = width / 2;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const APIURL =
          "https://api.thegraph.com/subgraphs/name/rob-lw/racecandy-tracker";

        const tokensQuery = `
        query {
          tokenMinteds {
            id
            metaId
          }
          tokenBoughts {
            id
            tokenId
            value
          }
        }
      `;

        const client = new ApolloClient({
          uri: APIURL,
          cache: new InMemoryCache(),
        });

        const response = await client.query({
          query: gql(tokensQuery),
        });
        setData(response.data);
      } catch {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      let valueMinted = data.tokenMinteds.length;
      let valueBought = data.tokenBoughts.length;
      let mintData = [];
      for (let num = data.tokenBoughts.length - 1; num >= 0; num--) {
        mintData.push({
          valueSold: data.tokenBoughts[num].value,
        });

        let sumSale = 0;
        let saleId = "";
        for (let num = mintData.length - 1; num >= 0; num--) {
          let count = parseInt(mintData[num].valueSold);
          let count2 = data.tokenBoughts[num].id;
          sumSale += count;
          saleId += count2 + ", ";
        }

        sumSale = (sumSale / 1000000000000000000) * 2322;
        let highestBid = 0;
        highestBid = sumSale / mintData.length;

        let rarecandyData = [
          {
            symbol: "Assets Minted to date",
            amount: valueMinted,
            color: "#19269b",
            inUSD: 1,
          },
          {
            symbol: "Assets Sold to date",
            amount: valueBought,
            color: "#78dd50",
            inUSD: 5,
          },
          {
            symbol: "Sales Value",
            amount: sumSale,
            color: "#00ffbd",
            inUSD: 0,
          },
          {
            symbol: "Highest Bid",
            amount: highestBid,
            color: "#00ffbd",
            inUSD: 0,
          },
          {
            symbol: "Sold Assets ID",
            amount: saleId,
            color: "#00ffbd",
            inUSD: 0,
          },
        ];
        setgData(rarecandyData);
      }
    }
  }, [data]);

  return (
    <main className="App-header">
      <div style={{paddingLeft: 320}} >
      <Text className="App-title" textAnchor="middle" fontSize={40}>
        Rarecandy 3D Volume Tracker
      </Text>
     </div>
      <svg width={width} height={width}>
        <Group top={half} left={half}>
          <Pie
            data={gData}
            pieValue={(data) => data.amount * data.inUSD}
            outerRadius={half}
            innerRadius={({ data }) => {
              const size = active && active.symbol == data.symbol ? 12 : 8;
              return half - size;
            }}
            padAngle={0.01}
          >
            {(pie) => {
              return pie.arcs.map((arc) => {
                return (
                  <g
                    key={arc.data.symbol}
                    onMouseEnter={() => setActive(arc.data)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <path d={pie.path(arc)} fill={arc.data.color}></path>
                  </g>
                );
              });
            }}
          </Pie>

          {active ? (
            <>
              <Text textAnchor="middle" fill="#fff" fontSize={35} dy={-20}>
                {active.amount == gData[1].amount
                  ? `Sold Asset ID: ${gData[4].amount}`
                  : null}
              </Text>

              <Text
                textAnchor="middle"
                fill={active.color}
                fontSize={20}
                dy={20}
              >
                {`${active.amount} ${active.symbol}`}
              </Text>
            </>
          ) : (
            <>
              <Text textAnchor="middle" fill="#fff" fontSize={40} dy={-20}>
                {gData.length != 0 ? `$${gData[2].amount} of Sales` : null}
              </Text>

              <Text textAnchor="middle" fill="#aaa" fontSize={20} dy={20}>
                {gData.length != 0
                  ? `$${gData[3].amount} Highest Sale to date`
                  : null}
              </Text>
            </>
          )}
        </Group>
      </svg>
    </main>
  );
}

export default App;
