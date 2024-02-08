import React, { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/pt-br"; // Defina o idioma para português do Brasil

// Função utilitária para manipulação de data e hora
const formatDate = (date) => moment(date).format("YYYY-MM-DD");

function RegistroConsumoEnergia({
  dataInicial,
  dataFinal,
  consumoMensalDesejado,
  valorKwhDiarioDesejado,
}) {
  const [valorAtualLeitura, setValorAtualLeitura] = useState("");
  const [valorKWHDia, setValorKWHDia] = useState("");
  const [historicoLeituras, setHistoricoLeituras] = useState([]);
  const [editarAtualLeitura, setEditarAtualLeitura] = useState(true);
  const [consumoMensal, setConsumoMensal] = useState(0);
  const [diasDisponiveis, setDiasDisponiveis] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [valorKwhDiarioProximo, setValorKwhDiarioProximo] = useState(0);

  useEffect(() => {
    const dias = [];
    let diaAtual = moment(dataInicial);
    const fimPeriodo = moment(dataFinal);

    while (diaAtual.isSameOrBefore(fimPeriodo)) {
      dias.push(formatDate(diaAtual));
      diaAtual = diaAtual.clone().add(1, "day");
    }
    setDiasDisponiveis(dias);
  }, [dataInicial, dataFinal]);

  useEffect(() => {
    // Função para calcular o consumo mensal
    const calcularConsumoMensal = () => {
      const consumoMensalTotal = historicoLeituras.reduce(
        (total, leitura) => total + parseFloat(leitura.kwhDiario),
        0
      );
      setConsumoMensal(consumoMensalTotal);
    };

    // Calcular o consumo mensal sempre que o histórico de leituras ou o consumoMensalDesejado for alterado
    calcularConsumoMensal();

    // Calcular o valor do KWH diário necessário para os dias restantes
    const diasRestantes = moment(dataFinal).diff(moment(), "days") + 1;
    const diferencaConsumoDesejado = consumoMensalDesejado - consumoMensal;
    setValorKwhDiarioProximo(diferencaConsumoDesejado / diasRestantes);
  }, [historicoLeituras, consumoMensalDesejado, dataFinal, consumoMensal]);

  const handleAtualLeituraChange = (event) => {
    setValorAtualLeitura(event.target.value);
  };

  const handleValorKWHDiaChange = (event) => {
    setValorKWHDia(event.target.value);
  };

  const handleDateTimeChange = (event) => {
    const selectedDateTimeValue = event.target.value;
    setSelectedDateTime(selectedDateTimeValue);
    // Atualize selectedDate com a parte da data de selectedDateTime
    const selectedDateValue = selectedDateTimeValue.split("T")[0];
    setSelectedDate(selectedDateValue);
  };

  const registrarLeitura = () => {
    if (!selectedDateTime) {
      alert("Por favor, selecione uma data para registrar a leitura.");
      return;
    }

    // Verificar se a data selecionada está dentro do período
    if (!diasDisponiveis.includes(selectedDate)) {
      alert("A data selecionada não está dentro do período especificado.");
      return;
    }

    // Verificar se o valor do kWh do dia é menor que o valor KWHAnterior
    if (
      historicoLeituras.length > 0 &&
      parseFloat(valorKWHDia) <
        parseFloat(historicoLeituras[historicoLeituras.length - 1].valorKWHDia)
    ) {
      const valorKWHAnterior =
        historicoLeituras[historicoLeituras.length - 1].valorKWHDia;
      alert(
        `O valor do kWh do dia (${valorKWHDia}) não pode ser menor que o valor KWHAnterior (${valorKWHAnterior}).`
      );
      return;
    }

    // Verificar se a data selecionada já foi registrada
    const leituraExistente = historicoLeituras.find((leitura) =>
      moment(leitura.data).isSame(selectedDateTime, "day")
    );
    if (leituraExistente) {
      alert(
        `Já existe um registro para o dia ${moment(selectedDateTime).format(
          "LL"
        )}.`
      );
      return;
    }

    // Calcular a diferença do KWH diário
    let diferencaKWH = 0;
    let valorKWHAnterior = 0;
    if (historicoLeituras.length > 0) {
      const ultimoRegistro = historicoLeituras[historicoLeituras.length - 1];
      diferencaKWH =
        parseFloat(valorKWHDia) - parseFloat(ultimoRegistro.valorKWHDia);
      valorKWHAnterior = parseFloat(ultimoRegistro.valorKWHDia);
    } else {
      diferencaKWH = parseFloat(valorKWHDia) - parseFloat(valorAtualLeitura);
      valorKWHAnterior = parseFloat(valorAtualLeitura);
    }

    // Verificar se a diferença do KWH diário é negativa
    if (diferencaKWH < 0) {
      alert(
        "O valor do kWh do dia não pode ser menor que o valor KWHAnterior."
      );
      return;
    }

    // Atualizar o histórico de leituras
    const novoHistoricoLeituras = [...historicoLeituras];
    const diaSelecionado = moment(selectedDateTime);
    const ultimoDiaRegistrado =
      novoHistoricoLeituras.length > 0
        ? moment(
            novoHistoricoLeituras[novoHistoricoLeituras.length - 1].data
          ).add(1, "day")
        : moment(dataInicial);
    const diasFaltantes = diaSelecionado.diff(ultimoDiaRegistrado, "days");

    // Preencher automaticamente os dias que faltam o registro de leitura
    if (diasFaltantes > 0 || (diasFaltantes === 0 && !leituraExistente)) {
      while (
        ultimoDiaRegistrado.isBefore(diaSelecionado) ||
        ultimoDiaRegistrado.isSame(diaSelecionado, "day")
      ) {
        const dataPreenchida = formatDate(ultimoDiaRegistrado);

        // Verificar se o dia já foi registrado
        const diaJaRegistrado = novoHistoricoLeituras.some((leitura) =>
          moment(leitura.data).isSame(dataPreenchida, "day")
        );

        // Se o dia já foi registrado, não adicione um novo registro
        if (!diaJaRegistrado) {
          const diferencaKWHDiario =
            parseFloat(valorKWHDia) - parseFloat(valorKWHAnterior);
          const kwhDiario = diferencaKWHDiario / (diasFaltantes + 1);
          const leituraPreenchida = {
            data: dataPreenchida,
            valorKWHDia: valorKWHDia,
            valorKWHAnterior: valorKWHAnterior,
            kwhDiario: kwhDiario.toFixed(2),
          };
          novoHistoricoLeituras.push(leituraPreenchida);
        }

        ultimoDiaRegistrado.add(1, "day");
      }
    }

    setHistoricoLeituras(novoHistoricoLeituras);

    // Limpar os campos de entrada
    setValorKWHDia("");
    setSelectedDate("");
    if (editarAtualLeitura) {
      setValorAtualLeitura("");
      setEditarAtualLeitura(false);
    }
  };

  const handleEditarLeitura = (index) => {
    const leituraEditada = historicoLeituras[index];
    setValorAtualLeitura(leituraEditada.valorAtualLeitura);
    setValorKWHDia(leituraEditada.valorKWHDia);

    // Remova a leitura editada do histórico
    const novoHistorico = [...historicoLeituras];
    novoHistorico.splice(index, 1);
    setHistoricoLeituras(novoHistorico);
  };

  const handleExcluirLeitura = (index) => {
    const novoHistorico = [...historicoLeituras];
    novoHistorico.splice(index, 1);
    setHistoricoLeituras(novoHistorico);
  };

  const handleEditarAtualLeitura = () => {
    setValorAtualLeitura("");
    setValorKWHDia("");
    setHistoricoLeituras([]);
    setEditarAtualLeitura(true);
  };

  return (
    <div className="RegistroConsumoEnergia">
      <h1>Registro de Consumo de Energia Diário</h1>

      <div>
        <label>
          Valor do KWH da Leitura Atual:
          <input
            type="number"
            value={valorAtualLeitura}
            onChange={handleAtualLeituraChange}
            disabled={!editarAtualLeitura && historicoLeituras.length > 0}
          />
        </label>
      </div>

      <div>
        <label>
          Valor do KWH do Dia:
          <input
            type="number"
            value={valorKWHDia}
            onChange={handleValorKWHDiaChange}
          />
        </label>
      </div>

      <div>
        <label>
          Selecione o Dia e Hora:
          <input
            type="datetime-local"
            value={selectedDateTime}
            onChange={handleDateTimeChange}
            min={moment(dataInicial).format("YYYY-MM-DDTHH:mm")}
            max={moment(dataFinal).format("YYYY-MM-DDTHH:mm")}
          />
        </label>
      </div>

      <button onClick={registrarLeitura}>Registrar Leitura</button>

      {historicoLeituras.length > 0 && (
        <div>
          <button onClick={handleEditarAtualLeitura}>
            Editar Última Leitura
          </button>
        </div>
      )}

      <div>
        <h2>Histórico de Leituras diárias</h2>
        <ul>
          {historicoLeituras.map((leitura, index) => (
            <li key={index}>
              {moment(leitura.data).format("LL")} - KWH Atual:{" "}
              {leitura.valorKWHDia}, KWH Anterior: {leitura.valorKWHAnterior},
              KWH Diário: {leitura.kwhDiario}
              {index === historicoLeituras.length - 1 && ( // Apenas o último item pode ser editado ou excluído
                <>
                  <button onClick={() => handleEditarLeitura(index)}>
                    Editar
                  </button>
                  <button onClick={() => handleExcluirLeitura(index)}>
                    Excluir
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Consumo Mensal Atual</h2>
        <p>{consumoMensal.toFixed(2)}</p>
        <p>Consumo Mensal Desejado: {consumoMensalDesejado}</p>
        <p>Valor do KWH Diário Desejado: {valorKwhDiarioDesejado}</p>
        <p>
          Valor do KWH Diário para atingir o Consumo Mensal Desejado:{" "}
          {valorKwhDiarioProximo.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default RegistroConsumoEnergia;
