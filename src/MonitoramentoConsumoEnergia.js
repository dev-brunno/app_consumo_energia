import React, { useState, useEffect } from "react";
import moment from "moment";
import { db } from "./firebase";
import {
  ref,
  onValue,
  off,
  getDatabase,
  set,
  remove,
  push,
} from "firebase/database";
import RegistroConsumoEnergia from "./RegistroConsumoEnergia";

function MonitoramentoConsumoEnergia() {
  const [periodos, setPeriodos] = useState([]);
  const [editingPeriodoIndex, setEditingPeriodoIndex] = useState(null);
  const [showRegistroConsumo, setShowRegistroConsumo] = useState(false);
  const [dataLeituraAtual, setDataLeituraAtual] = useState("");
  const [dataProximaLeitura, setDataProximaLeitura] = useState("");
  const [consumoMensalDesejado, setConsumoMensalDesejado] = useState("");
  const [periodoEditado, setPeriodoEditado] = useState(null);

  useEffect(() => {
    const periodosRef = ref(db, "periodos");
    onValue(
      periodosRef,
      (snapshot) => {
        const periodosData = snapshot.val();
        const periodosArray = [];
        for (let key in periodosData) {
          periodosArray.push({
            key: key,
            ...periodosData[key],
          });
        }
        setPeriodos(periodosArray);
      },
      (error) => {
        console.log("Erro ao buscar os periodos:", error.message);
      }
    );

    return () => off(periodosRef);
  }, []);

  const handleAddPeriodo = () => {
    if (!dataLeituraAtual || !dataProximaLeitura || !consumoMensalDesejado) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const novoPeriodo = {
      dataLeituraAtual,
      dataProximaLeitura,
      consumoMensalDesejado,
      historicoLeituras: [],
      resumo: {
        periodo: "",
        diasEntreLeituras: "",
        consumoMensal: 0,
        consumoMensalDesejado: 0,
        valorKwhDiarioDesejado: 0,
        valorKwhDiarioProximo: 0,
      },
    };

    const periodosRef = ref(db, "periodos");

    push(periodosRef, novoPeriodo)
      .then(() => {
        console.log("Novo período adicionado com sucesso!");
      })
      .catch((error) => {
        console.log("Erro ao adicionar novo período:", error.message);
      });

    setDataLeituraAtual("");
    setDataProximaLeitura("");
    setConsumoMensalDesejado("");
  };

  const handleEditPeriodo = (index) => {
    setEditingPeriodoIndex(index);
    const novoPeriodoEditado = {
      ...periodos[index],
      index: index,
    };
    setPeriodoEditado(novoPeriodoEditado);
    setShowRegistroConsumo(true);
  };

  const handleDeletePeriodo = (index) => {
    const periodoKey = periodos[index].key;
    const periodoRef = ref(db, `periodos/${periodoKey}`);
    remove(periodoRef)
      .then(() => {
        console.log("Período excluído com sucesso!");
      })
      .catch((error) => {
        console.log("Erro ao excluir o período:", error.message);
      });
  };

  const handleBackToList = () => {
    setShowRegistroConsumo(false);
    setEditingPeriodoIndex(null);
  };

  const handleUpdatePeriodoEditado = (periodoEditado) => {
    const periodoKey = periodos[editingPeriodoIndex].key;
    set(ref(getDatabase(), `periodos/${periodoKey}`), periodoEditado);
    setEditingPeriodoIndex(null);
  };

  return (
    <div className="p-10">
      {!editingPeriodoIndex && !showRegistroConsumo && (
        <>
          <div className=" bg-custom-roxo p-5 rounded-2xl mb-10">
            <h2 className=" text-2xl font-bold text-custom-amarelo leading-6">
              Criar um novo monitoramento mensal de consumo de energia
            </h2>
            <div className="grid gap-6 mb-6 md:grid-cols-2 mt-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Data da Leitura Atual:
                </label>
                <input
                  type="date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={dataLeituraAtual}
                  onChange={(e) => setDataLeituraAtual(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Data da Próxima Leitura:
                </label>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="date"
                  value={dataProximaLeitura}
                  onChange={(e) => setDataProximaLeitura(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Consumo mensal desejado (em KWH):
                </label>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="number"
                  value={consumoMensalDesejado}
                  onChange={(e) => setConsumoMensalDesejado(e.target.value)}
                />
              </div>
              <button
                onClick={handleAddPeriodo}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              >
                Criar
              </button>
            </div>
          </div>
        </>
      )}
      <div className="">
        <h3 className=" text-2xl text-custom-roxo font-black">
          Monitoramentos Mensais
        </h3>
        <div className=" mt-4 grid gap-4">
          {periodos.map((periodo, index) => (
            <div key={index}>
              {!showRegistroConsumo && (
                <>
                  <div className=" bg-custom-cinza p-4 rounded-xl">
                    <div className="flex space-x-1 font-bold text-lg justify-center">
                      <h5 className="">Período:</h5>
                      <p>
                        {moment(periodo.dataLeituraAtual).format("DD/MM/YYYY")}{" "}
                        -{" "}
                        {moment(periodo.dataProximaLeitura).format(
                          "DD/MM/YYYY"
                        )}
                      </p>
                    </div>
                    <div className="flex justify-between mt-6">
                      <button
                        class="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:focus:ring-yellow-900"
                        onClick={() => handleEditPeriodo(index)}
                      >
                        Editar
                      </button>
                      <button
                        class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                        onClick={() => handleDeletePeriodo(index)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </>
              )}
              {showRegistroConsumo && editingPeriodoIndex === index && (
                <>
                  <button
                    class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    onClick={handleBackToList}
                  >
                    Voltar
                  </button>
                  <RegistroConsumoEnergia
                    dataInicial={
                      periodos[periodoEditado.index].dataLeituraAtual
                    }
                    dataFinal={
                      periodos[periodoEditado.index].dataProximaLeitura
                    }
                    consumoMensalDesejado={
                      periodos[periodoEditado.index].consumoMensalDesejado
                    }
                    periodoEditado={periodoEditado}
                    updatePeriodoEditado={handleUpdatePeriodoEditado}
                    setShowRegistroConsumo={setShowRegistroConsumo}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MonitoramentoConsumoEnergia;
