const brands = S('marcas')

const API_BRANDS = 'https://parallelum.com.br/fipe/api/v1/carros/marcas'


fetch(API_BRANDS)
    .then(res => res.json())
    .then(res => {
        res.forEach(r => {
            brands.innerHTML += `
                <option value="${r.codigo + '/' + r.nome}">${r.nome}</option>
            `
        })
    })



class ListAuto {
    constructor(element) {
        this.element = document.querySelector(element)
        this.list = localStorage.getItem('autos') && JSON.parse(localStorage.getItem('autos')) || []
    }

    addAuto(auto) {
        if (this.contains(auto)) {
            const index = this.list.indexOf(auto)
            this.list.splice(index, 1)
        } else {
            this.list.push(auto)
        }

        localStorage.removeItem('autos')
        localStorage.setItem('autos', JSON.stringify(this.list))

        this.render()
    }

    contains(auto) {
        return this.list.some(at => at.Modelo === auto.Modelo)
    }

    render() {
        this.element.innerHTML = ''
        this.list.forEach(res => {
            this.element.innerHTML += `
            <tr>
                <td>${res.Marca}</td>
                <td>${res.Modelo}</td>
                <td>${res.Valor}</td>
            </tr>
        `
        })
        if (this.list.length === 0) {
            this.element.innerHTML = `
        <tr>
            <td colspan="3">Sem carro na lista</td>
        </tr>
        `
        }
    }
}

const listAuto = new ListAuto('.table tbody')


/**
 * @author Washington Developer
 * @description Responsavel em fazer a seleção da marcas
 * @name MySelect
 */
class MySelect {

    constructor(idElement) {
        this.element = S(idElement)
        this.observers = []

        this.element.addEventListener('change', this.change.bind(this))
    }

    change(e) {
        const [code, nome] = e.target.value.split('/')

        this.notifyObservers(code)
    }

    addObserver(observer) {
        this.observers.push(observer)
    }

    notifyObservers(code) {
        this.observers.forEach(observer => observer.update(code))
    }

}

/**
 * @author Washington Developer
 * @name ModelObserver
 * @description Responsavel em fazer a seleção dos modelos
 */
class ModelObserver {

    constructor(idElement) {
        this.element = S(idElement)

        this.observers = []
        this.code = 0

        this.element.addEventListener('change', this.change.bind(this))
    }

    change(e) {
        const [code, nome] = e.target.value.split('/')

        this.notifyObservers(code)
    }

    addObserver(observer) {
        this.observers.push(observer)
    }

    notifyObservers(codeModels) {
        this.observers.forEach(observer => observer.update(this.code, codeModels))
    }

    update(code) {
        this.code = code

        this.element.innerHTML = ''

        fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${code}/modelos`)
            .then(res => res.json())
            .then(res => {
                res.modelos.forEach(r => {
                    this.element.innerHTML += `
                    <option value="${r.codigo + "/" + r.nome}">${r.nome}</option>
                `
                })
            })
    }
}

/**
 * @author Washington Developer
 * @name YearObserver
 * @description Responsavel em fazer a seleção do Ano
 */
class YearObserver {
    constructor(idElement) {
        this.element = S(idElement)

        this.codeBrand
        this.codeModel

        this.element.addEventListener('change', this.change.bind(this))
        this.observers = []
    }

    change(e) {
        const [code, nome] = e.target.value.split('/')

        this.notifyObservers(code)
    }

    addObserver(observer) {
        this.observers.push(observer)
    }

    notifyObservers(codeYear) {
        this.observers.forEach(observer => observer.update(this.codeBrand, this.codeModel, codeYear))
    }

    update(codeBrand, codeModel) {

        this.codeBrand = codeBrand
        this.codeModel = codeModel

        this.element.innerHTML = ''

        fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${codeBrand}/modelos/${codeModel}/anos`)
            .then(res => res.json())
            .then(res => {
                res.forEach(r => {
                    this.element.innerHTML += `
                    <option value="${r.codigo + "/" + r.nome}">${r.nome}</option>
                `
                })
            })
    }
}

/**
 * @author Washington Developer
 * @name Auto
 * @description Responsavel em fazer o preenchimento do carro quando o Ano é selecionado
 */
class Auto {

    constructor(idElement) {
        this.element = S(idElement)
    }

    update(codeBrand, codeModel, codeYear) {

        fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${codeBrand}/modelos/${codeModel}/anos/${codeYear}`)
            .then(res => res.json())
            .then(res => {
                this.element.innerHTML = `
                    <img src="https://via.placeholder.com/130" alt="image">
                    <div class="auto-details">
                        <h3>${res.Marca}</h3>
                        <p>${res.Modelo}</p>
                        <button>${res.Combustivel}</button> <span>${res.AnoModelo}</span> <span>FIPE: ${res.CodigoFipe}</span>
                    </div>
                    <div class="auto-value">
                        <h3>${res.Valor}</h3>
                        <p>${res.MesReferencia}</p>
                        <i class="fa fa-star-o" aria-hidden="true"></i>
                    </div>
                `
                new Start('i.fa', res)
            })
    }
}

class Start {
    constructor(element, auto) {
        this.element = document.querySelector(element)
        this.auto = auto
        this.element.addEventListener('click', this.clicked.bind(this))

        if (listAuto.contains(auto)) {
            this.element.classList.toggle('fa-star')
            this.element.classList.toggle('fa-star-o')
        }
    }

    clicked(e) {
        this.element.classList.toggle('fa-star')
        this.element.classList.toggle('fa-star-o')

        listAuto.addAuto(this.auto)
    }
}



const brand = new MySelect('marcas');
const modelObserver = new ModelObserver('modelos')
const yearObserver = new YearObserver('anos')
const auto = new Auto('auto')

brand.addObserver(modelObserver)

modelObserver.addObserver(yearObserver)
yearObserver.addObserver(auto)


listAuto.render()

/**
 * Utilitarios
 */
function S(idElement) {
    return document.getElementById(idElement)
}
