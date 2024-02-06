import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/pt-br'; // Defina o idioma para português do Brasil

function RegistroConsumoEnergia({ dataInicial, dataFinal }) {
  const [valorAtualLeitura, setValorAtualLeitura] = useState('');
  const [valorKWHDia, setValorKWHDia] = useState('');
  const [historicoLeituras, setHistoricoLeituras] = useState([]);
  const [editarAtualLeitura, setEditarAtualLeitura] = useState(true);
  const [consumoMensal, setConsumoMensal] = useState(0);
  const [diasDisponiveis, setDiasDisponiveis] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState('');

  useEffect(() => {
    const dias = [];
    let diaAtual = moment(dataInicial);
    const fimPeriodo = moment(dataFinal);

    while (diaAtual.isSameOrBefore(fimPeriodo)) {
      dias.push(diaAtual.format('YYYY-MM-DD'));
      diaAtual = diaAtual.clone().add(1, 'day');
    }
    setDiasDisponiveis(dias);
    console.log(dias)
  }, [dataInicial, dataFinal]);

  useEffect(() => {
    // Calcular o consumo mensal sempre que o histórico de leituras for alterado
    const consumoMensalTotal = historicoLeituras.reduce((total, leitura) => {
      return total + parseFloat(leitura.kwhDiario);
    }, 0);
    setConsumoMensal(consumoMensalTotal);
  }, [historicoLeituras]);

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
    const selectedDateValue = selectedDateTimeValue.split('T')[0];
    setSelectedDate(selectedDateValue);
  };
  
  const registrarLeitura = () => {
    if (!selectedDateTime) {
      alert('Por favor, selecione uma data para registrar a leitura.');
      return;
    }
  
    // Verificar se a data selecionada está dentro do período
    if (!diasDisponiveis.includes(selectedDate)) {
      alert('A data selecionada não está dentro do período especificado.');
      return;
    }
  
    // Verificar se o valor do kWh do dia é menor que o valor KWHAnterior
    if (historicoLeituras.length > 0 && parseFloat(valorKWHDia) < parseFloat(historicoLeituras[historicoLeituras.length - 1].valorKWHDia)) {
      const valorKWHAnterior = historicoLeituras[historicoLeituras.length - 1].valorKWHDia;
      alert(`O valor do kWh do dia (${valorKWHDia}) não pode ser menor que o valor KWHAnterior (${valorKWHAnterior}).`);
      return;
    }
  
    // Verificar se a data selecionada já foi registrada
    const leituraExistente = historicoLeituras.find((leitura) => moment(leitura.data).isSame(selectedDateTime, 'day'));
    if (leituraExistente) {
      alert(`Já existe um registro para o dia ${moment(selectedDateTime).format('LL')}.`);
      return;
    }
  
    // Obter a data e hora atual
    const dataHoraAtual = moment().format('LLLL');
  
    // Calcular a diferença do KWH diário
    let diferencaKWH = 0;
    let valorKWHAnterior = 0;
    if (historicoLeituras.length > 0) {
      const ultimoRegistro = historicoLeituras[historicoLeituras.length - 1];
      diferencaKWH = parseFloat(valorKWHDia) - parseFloat(ultimoRegistro.valorKWHDia);
      valorKWHAnterior = parseFloat(ultimoRegistro.valorKWHDia);
    } else {
      diferencaKWH = parseFloat(valorKWHDia) - parseFloat(valorAtualLeitura);
      valorKWHAnterior = parseFloat(valorAtualLeitura);
    }
  
    // Verificar se a diferença do KWH diário é negativa
    if (diferencaKWH < 0) {
      alert('O valor do kWh do dia não pode ser menor que o valor KWHAnterior.');
      return;
    }
  
    // Criar um objeto com os dados da leitura
    const leitura = {
      dataHora: dataHoraAtual,
      data: selectedDateTime,
      valorKWHDia,
      valorKWHAnterior,
      kwhDiario: diferencaKWH.toFixed(2),
    };
  
    // Atualizar o histórico de leituras
    setHistoricoLeituras([...historicoLeituras, leitura]);
  
    // Limpar os campos de entrada
    setValorKWHDia('');
    setSelectedDate('');
    if (editarAtualLeitura) {
      setValorAtualLeitura('');
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
    setValorAtualLeitura('');
    setValorKWHDia('');
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
          <input type="number" value={valorKWHDia} onChange={handleValorKWHDiaChange} />
        </label>
      </div>

      <div>
        <label>
          Selecione o Dia e Hora:
          <input 
            type="datetime-local" 
            value={selectedDateTime} 
            onChange={handleDateTimeChange} 
            min={moment(dataInicial).format('YYYY-MM-DDTHH:mm')} 
            max={moment(dataFinal).format('YYYY-MM-DDTHH:mm')} 
          />
        </label>
      </div>

      <button onClick={registrarLeitura}>Registrar Leitura</button>

      {historicoLeituras.length > 0 && (
        <div>
          <button onClick={handleEditarAtualLeitura}>Editar Última Leitura</button>
        </div>
      )}

      <div>
        <h2>Histórico de Leituras diárias</h2>
        <ul>
          {historicoLeituras.map((leitura, index) => (
            <li key={index}>
              {moment(leitura.data).format('LLLL')} - KWH Atual: {leitura.valorKWHDia}, KWH Anterior: {leitura.valorKWHAnterior}, KWH Diário: {leitura.kwhDiario}
              {index === historicoLeituras.length - 1 && ( // Apenas o último item pode ser editado ou excluído
                <>
                  <button onClick={() => handleEditarLeitura(index)}>Editar</button>
                  <button onClick={() => handleExcluirLeitura(index)}>Excluir</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Consumo Mensal Atual</h2>
        <p>{consumoMensal.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default RegistroConsumoEnergia;
