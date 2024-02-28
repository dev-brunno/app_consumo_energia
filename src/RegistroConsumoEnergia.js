import React, { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/pt-br";
const formatDate = (date) => moment(date).format("YYYY-MM-DD");

function RegistroConsumoEnergia({
  dataInicial,
  dataFinal,
  consumoMensalDesejado,
  periodoEditado,
  updatePeriodoEditado,
  setShowRegistroConsumo,
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
  const [valorKwhDiarioDesejado, setValorKwhDiarioDesejado] = useState(0);
  const [periodo, setPeriodo] = useState("");
  const [diasEntreLeituras, setDiasEntreLeituras] = useState("");
  const [dataInicialEditada, setDataInicialEditada] = useState(dataInicial);
  const [dataFinalEditada, setDataFinalEditada] = useState(dataFinal);
  const [consumoMensalDesejadoEditado, setConsumoMensalDesejadoEditado] =
    useState(consumoMensalDesejado);

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
    const calcularConsumoMensal = () => {
      if (historicoLeituras && historicoLeituras.length > 0) {
        const consumoMensalTotal = historicoLeituras.reduce(
          (total, leitura) => total + parseFloat(leitura.kwhDiario),
          0
        );
        setConsumoMensal(consumoMensalTotal);
      }
    };

    if (historicoLeituras && historicoLeituras.length > 0) {
      const calcularMediaDiariaDesejada = () => {
        const diasRestantes = moment(dataFinal).diff(
          historicoLeituras[historicoLeituras.length - 1].data,
          "days"
        );
        const diferencaConsumoDesejado = consumoMensalDesejado - consumoMensal;
        setValorKwhDiarioProximo(diferencaConsumoDesejado / diasRestantes);
      };

      calcularMediaDiariaDesejada();
    }

    const calcularMediaDesejadaMensal = () => {
      const periodoString = `${moment(dataInicial).format(
        "DD/MM/YYYY"
      )} - ${moment(dataFinal).format("DD/MM/YYYY")}`;
      setPeriodo(periodoString);

      const numDiasEntreLeitura =
        moment(dataFinal).diff(moment(dataInicial), "days") + 1;
      setDiasEntreLeituras(numDiasEntreLeitura);

      const numValorKwhDiarioDesejado =
        consumoMensalDesejado / numDiasEntreLeitura;
      setValorKwhDiarioDesejado(numValorKwhDiarioDesejado);
    };

    calcularConsumoMensal();
    calcularMediaDesejadaMensal();
  }, [
    historicoLeituras,
    consumoMensalDesejado,
    dataFinal,
    consumoMensal,
    dataInicial,
  ]);

  useEffect(() => {
    if (periodoEditado) {
      setDataInicialEditada(periodoEditado.dataLeituraAtual);
      setDataFinalEditada(periodoEditado.dataProximaLeitura);
      setConsumoMensalDesejadoEditado(periodoEditado.consumoMensalDesejado);
      setHistoricoLeituras(periodoEditado.historicoLeituras);
      // Defina outros estados conforme necessário
    }
  }, [periodoEditado]);

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
      historicoLeituras &&
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
    const leituraExistente = historicoLeituras?.find((leitura) =>
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
    if (historicoLeituras && historicoLeituras.length > 0) {
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
    const novoHistoricoLeituras = [...(historicoLeituras ?? [])];
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

  const handleSalvarLeitura = () => {
    handleUpdatePeriodoEditado();
    setShowRegistroConsumo(false);
  };

  const handleUpdatePeriodoEditado = () => {
    const periodoAtualizado = {
      dataLeituraAtual: dataInicialEditada,
      dataProximaLeitura: dataFinalEditada,
      consumoMensalDesejado: consumoMensalDesejadoEditado,
      historicoLeituras: historicoLeituras,
      resumo: {
        periodo: periodo,
        diasEntreLeituras: diasEntreLeituras,
        consumoMensal: consumoMensal,
        consumoMensalDesejado: consumoMensalDesejado,
        valorKwhDiarioDesejado: valorKwhDiarioDesejado,
        valorKwhDiarioProximo: valorKwhDiarioProximo,
      },
    };

    updatePeriodoEditado(periodoAtualizado);
  };

  return (
    <div className="RegistroConsumoEnergia ">
      <div className=" bg-custom-roxo p-5 rounded-2xl">
        <h1 className=" text-custom-amarelo font-bold text-2xl">
          Registro de Consumo de Energia Diário
        </h1>
        <div className=" grid space-y-2 my-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              Data da Leitura Atual
            </label>
            <input
              className="bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-36 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              type="date"
              value={dataInicialEditada}
              onChange={(e) => setDataInicialEditada(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              Data da Próxima Leitura
            </label>
            <input
              className="bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-36 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              type="date"
              value={dataFinalEditada}
              onChange={(e) => setDataFinalEditada(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              Consumo mensal desejado (em KWH):
            </label>
            <input
              className="bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-36 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              type="number"
              value={consumoMensalDesejadoEditado}
              onChange={(e) => setConsumoMensalDesejadoEditado(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              Valor do KWH da Leitura Atual:
              <input
                className="bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-36 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                type="number"
                value={valorAtualLeitura}
                onChange={handleAtualLeituraChange}
                disabled={historicoLeituras && historicoLeituras.length > 0}
              />
            </label>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              Valor do KWH do Dia:
              <input
                className="bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-36 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                type="number"
                value={valorKWHDia}
                onChange={handleValorKWHDiaChange}
              />
            </label>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              Selecione o Dia e Hora:
              <input
                className="bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-48 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                type="datetime-local"
                value={selectedDateTime}
                onChange={handleDateTimeChange}
                min={moment(dataInicial).format("YYYY-MM-DDTHH:mm")}
                max={moment(dataFinal).format("YYYY-MM-DDTHH:mm")}
              />
            </label>
          </div>
        </div>

        <button
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={registrarLeitura}
        >
          Registrar Leitura
        </button>
        <button
          class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          onClick={handleSalvarLeitura}
        >
          Salvar
        </button>

        {historicoLeituras && historicoLeituras.length > 0 && (
          <div>
            <button
              class="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:focus:ring-yellow-900"
              onClick={handleEditarAtualLeitura}
            >
              Editar Última Leitura
            </button>
          </div>
        )}
      </div>

      <div className=" bg-custom-blue w-full max-w-md p-4 border-gray-200 rounded-2xl shadow sm:p-8  mt-10 text-white">
        {historicoLeituras && historicoLeituras.length > 0 && (
          <div>
            <h2 className="text-xl font-bold leading-none mb-4">Resumo</h2>
            <div className=" space-y-4">
              <p>
                Período: <span className=" font-bold">{periodo}</span>{" "}
              </p>
              <p>
                Número de Dias entre as Leituras:{" "}
                <span className=" font-bold">{diasEntreLeituras}</span>
              </p>
              <p>
                Consumo Mensal Desejado:{" "}
                <span className=" font-bold">{consumoMensalDesejado}</span>
              </p>
              <p>
                Consumo mensal atual:{" "}
                <span className=" bg-slate-700 p-2 rounded-xl">
                  {consumoMensal.toFixed(2)}
                </span>
              </p>
              <p>
                Valor do KWH Diário Desejado:{" "}
                <span className=" font-bold">
                  {valorKwhDiarioDesejado.toFixed(2)}
                </span>
              </p>
              <p>
                Valor do KWH Diário Atual:{" "}
                <span className=" bg-slate-700 p-2 rounded-xl">
                  {valorKwhDiarioProximo.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className=" mt-10">
        {historicoLeituras && historicoLeituras.length > 0 && (
          <div className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8">
            <h2 className="text-xl font-bold leading-none text-gray-900 mb-4">
              Histórico de Leituras diárias
            </h2>
            <ul className=" flex flex-col space-y-2">
              {historicoLeituras.map((leitura, index) => (
                <li
                  className=" bg-custom-amarelo p-2 rounded-2xl space-y-2"
                  key={index}
                >
                  <h4 className=" font-bold">
                    {moment(leitura.data).format("LL")}
                  </h4>
                  <p>
                    KWH Atual: {leitura.valorKWHDia} KWH Anterior:{" "}
                    {leitura.valorKWHAnterior}
                  </p>
                  <p className=" bg-gray-600 p-1 inline-block rounded-md text-white">
                    KWH Diário:{" "}
                    <span className=" font-bold">{leitura.kwhDiario}</span>
                  </p>
                  {index === historicoLeituras.length - 1 && (
                    <>
                      <div>
                        <button
                          className="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:focus:ring-yellow-900"
                          onClick={() => handleEditarLeitura(index)}
                        >
                          Editar
                        </button>
                        <button
                          className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                          onClick={() => handleExcluirLeitura(index)}
                        >
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistroConsumoEnergia;
