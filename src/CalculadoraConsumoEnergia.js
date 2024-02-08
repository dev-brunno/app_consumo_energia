import React, { useState } from "react";
import moment from "moment";
import RegistroConsumoEnergia from "./RegistroConsumoEnergia"; // Importe o componente

function CalculadoraConsumoEnergia() {
  const [dataLeituraAtual, setDataLeituraAtual] = useState("");
  const [dataProximaLeitura, setDataProximaLeitura] = useState("");
  const [consumoMensalDesejado, setConsumoMensalDesejado] = useState("");
  const [valorKwhDiario, setValorKwhDiario] = useState(0);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const calcularConsumoEnergia = () => {
    // Verifica se todos os campos foram preenchidos
    if (!dataLeituraAtual || !dataProximaLeitura || !consumoMensalDesejado) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    // Calcula o número de dias entre as datas
    const diasEntreDatas =
      moment(dataProximaLeitura).diff(moment(dataLeituraAtual), "days") + 1;

    // Calcula o valor do KWH diário necessário para atingir a média mensal desejada
    const kwhDiario = consumoMensalDesejado / diasEntreDatas;

    // Define o valor do KWH diário no estado
    setValorKwhDiario(kwhDiario.toFixed(2));

    // Define as datas inicial e final para passar como props
    setDataInicial(dataLeituraAtual);
    setDataFinal(dataProximaLeitura);
  };

  return (
    <div>
      <h2>Calculadora de Consumo de Energia</h2>
      <div>
        <label>Data da Leitura Atual:</label>
        <input
          type="date"
          value={dataLeituraAtual}
          onChange={(e) => setDataLeituraAtual(e.target.value)}
        />
      </div>
      <div>
        <label>Data da Próxima Leitura:</label>
        <input
          type="date"
          value={dataProximaLeitura}
          onChange={(e) => setDataProximaLeitura(e.target.value)}
        />
      </div>
      <div>
        <label>Consumo mensal desejado (em KWH):</label>
        <input
          type="number"
          value={consumoMensalDesejado}
          onChange={(e) => setConsumoMensalDesejado(e.target.value)}
        />
      </div>
      <button onClick={calcularConsumoEnergia}>Calcular</button>
      {valorKwhDiario > 0 && (
        <div>
          <h3>Resultado</h3>
          <p>
            Período: {moment(dataInicial).format("DD/MM/YYYY")} -{" "}
            {moment(dataFinal).format("DD/MM/YYYY")}
          </p>
          <p>
            Número de Dias entre as Leituras:{" "}
            {moment(dataProximaLeitura).diff(moment(dataLeituraAtual), "days") +
              1}
          </p>
          <p>Consumo Mensal Desejado: {consumoMensalDesejado} KWH</p>
          <p>Valor do KWH Diário Necessário: {valorKwhDiario}</p>
          {/* Renderize o componente RegistroConsumoEnergia passando as datas inicial e final */}
          <RegistroConsumoEnergia
            dataInicial={dataInicial}
            dataFinal={dataFinal}
            consumoMensalDesejado={consumoMensalDesejado}
            valorKwhDiarioDesejado={valorKwhDiario}
          />
        </div>
      )}
    </div>
  );
}

export default CalculadoraConsumoEnergia;
