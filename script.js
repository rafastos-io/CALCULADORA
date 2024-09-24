document.addEventListener('DOMContentLoaded', function() {
    const gorjetaSlider = document.getElementById('porcentagemGorjeta');
    const gorjetaValor = document.getElementById('gorjetaValor');

    gorjetaSlider.addEventListener('input', function() {
        gorjetaValor.textContent = this.value + '%';
    });

    atualizarCheckboxesPessoas();
});

let pessoas = [];
let itens = [];

function adicionarPessoa() {
    const nomePessoa = document.getElementById('nomePessoa').value.trim();
    if (nomePessoa) {
        pessoas.push(nomePessoa);
        atualizarListaPessoas();
        atualizarCheckboxesPessoas();
        document.getElementById('nomePessoa').value = '';
    } else {
        alert('Por favor, insira um nome válido.');
    }
}

function removerPessoa(index) {
    pessoas.splice(index, 1);
    atualizarListaPessoas();
    atualizarCheckboxesPessoas();
}

function atualizarListaPessoas() {
    const listaPessoas = document.getElementById('listaPessoas');
    listaPessoas.innerHTML = '';
    pessoas.forEach((pessoa, index) => {
        const pessoaElement = document.createElement('div');
        pessoaElement.className = 'ios-list-item';
        pessoaElement.innerHTML = `
            <span>${pessoa}</span>
            <button onclick="removerPessoa(${index})" class="ios-button ios-button-small">Remover</button>
        `;
        listaPessoas.appendChild(pessoaElement);
    });
}

function atualizarCheckboxesPessoas() {
    const checkboxGroup = document.getElementById('pessoasEnvolvidas');
    checkboxGroup.innerHTML = '';
    if (pessoas.length === 0) {
        checkboxGroup.innerHTML = '<p>Adicione pessoas primeiro</p>';
    } else {
        pessoas.forEach((pessoa, index) => {
            const checkbox = document.createElement('div');
            checkbox.className = 'ios-checkbox';
            checkbox.innerHTML = `
                <input type="checkbox" id="pessoa${index}" value="${index}">
                <label for="pessoa${index}">${pessoa}</label>
            `;
            checkboxGroup.appendChild(checkbox);
        });
    }
}

function adicionarItem() {
    const nomeItem = document.getElementById('nomeItem').value.trim();
    const valorItem = parseFloat(document.getElementById('valorItem').value);
    const pessoasEnvolvidas = Array.from(document.querySelectorAll('#pessoasEnvolvidas input[type="checkbox"]:checked')).map(checkbox => parseInt(checkbox.value));
    
    if (nomeItem && !isNaN(valorItem) && valorItem > 0 && pessoasEnvolvidas.length > 0) {
        itens.push({ nome: nomeItem, valor: valorItem, pessoasEnvolvidas: pessoasEnvolvidas });
        atualizarListaItens();
        document.getElementById('nomeItem').value = '';
        document.getElementById('valorItem').value = '';
        document.querySelectorAll('#pessoasEnvolvidas input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    } else {
        alert('Por favor, insira um nome de item válido, um valor maior que zero e selecione pelo menos uma pessoa envolvida.');
    }
}

function removerItem(index) {
    itens.splice(index, 1);
    atualizarListaItens();
}

function atualizarListaItens() {
    const listaItens = document.getElementById('listaItens');
    listaItens.innerHTML = '';
    itens.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'ios-list-item';
        const pessoasEnvolvidas = item.pessoasEnvolvidas.map(i => pessoas[i]).join(', ');
        itemElement.innerHTML = `
            <span>${item.nome}: R$ ${item.valor.toFixed(2)} (${pessoasEnvolvidas})</span>
            <button onclick="removerItem(${index})" class="ios-button ios-button-small">Remover</button>
        `;
        listaItens.appendChild(itemElement);
    });
}

function calcularDivisao() {
    const valorTotal = itens.reduce((total, item) => total + item.valor, 0);
    const porcentagemGorjeta = parseFloat(document.getElementById('porcentagemGorjeta').value);

    if (isNaN(porcentagemGorjeta)) {
        alert('Por favor, defina uma porcentagem de gorjeta válida.');
        return;
    }

    if (pessoas.length === 0) {
        alert('Adicione pelo menos uma pessoa à lista.');
        return;
    }

    if (itens.length === 0) {
        alert('Adicione pelo menos um item à conta.');
        return;
    }

    const gorjeta = valorTotal * (porcentagemGorjeta / 100);
    const valorTotalComGorjeta = valorTotal + gorjeta;

    // Adicionando verificação para evitar divisão por zero
    const totalPessoasEnvolvidas = itens.reduce((total, item) => total + item.pessoasEnvolvidas.length, 0);
    if (totalPessoasEnvolvidas === 0) {
        alert('Nenhuma pessoa está envolvida nos itens.');
        return;
    }

    const divisaoIndividual = {};
    pessoas.forEach(pessoa => {
        divisaoIndividual[pessoa] = 0;
    });

    itens.forEach(item => {
        const valorPorPessoa = item.valor / item.pessoasEnvolvidas.length;
        item.pessoasEnvolvidas.forEach(index => {
            divisaoIndividual[pessoas[index]] += valorPorPessoa;
        });
    });

    const totalIndividual = Object.values(divisaoIndividual).reduce((a, b) => a + b, 0);
    for (const pessoa in divisaoIndividual) {
        const proporcao = divisaoIndividual[pessoa] / totalIndividual;
        const gorjetaProporcional = gorjeta * proporcao;
        divisaoIndividual[pessoa] += gorjetaProporcional;
    }

    document.getElementById('totalComGorjeta').textContent = `R$ ${valorTotalComGorjeta.toFixed(2)}`;
    document.getElementById('gorjetaTotal').textContent = `R$ ${gorjeta.toFixed(2)}`;

    const resultado = document.getElementById('resultado');
    resultado.classList.remove('resultado-hidden');

    const resultadoIndividual = document.getElementById('resultadoIndividual');
    resultadoIndividual.innerHTML = '<h3>Divisão individual:</h3>';
    for (const [pessoa, valor] of Object.entries(divisaoIndividual)) {
        resultadoIndividual.innerHTML += `<div class="ios-result-item"><span>${pessoa}</span><span>R$ ${valor.toFixed(2)}</span></div>`;
    }

    document.getElementById('valorPorPessoa').parentElement.remove();
}
