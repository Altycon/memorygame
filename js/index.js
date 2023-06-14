class MemorySet{
    constructor(type,set){
        this.type = type || 'none';
        this.set = set || [];
    }
    double(){
        if(this.set.length > 0){
            this.doubled = [];
            for(let i = 0; i < this.set.length; i++){
                this.doubled.push(i);
                this.doubled.unshift(i);
            }
        }
    }
    shuffle(){
        if(!this.shuffled) this.shuffled = [...this.doubled];
    
        for (let i = this.doubled.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.shuffled[i];
            this.shuffled[i] = this.shuffled[j];
            this.shuffled[j] = temp;
        }
    }
}
class MemoryGame{
    constructor(mainElementClass = document){
        this.main = document.querySelector(`${mainElementClass}`);
        this.display = this.main.querySelector('.game-display');
        this.settings = [...this.main.querySelectorAll('[data-settings]')];
        this.controls = [...this.main.querySelectorAll('[data-controls]')];
        this.stats = [...this.main.querySelectorAll('[data-stats]')];
        this.cardList = this.display.querySelector(`.card-list`);
        this.cards = [...this.main.querySelectorAll(`${mainElementClass} .card`)];
        this.sets = [
            new MemorySet('numbers',[1,2,3,4,5,6,7,8]),
            new MemorySet('colors', [60, 120, 180, 240, 300, 360]),
            new MemorySet('images', [
                './img/there.jpeg',
                './img/cute.jpeg',
                './img/digital-matter.jpeg',
                './img/fractal-mass.jpeg',
                './img/inward.jpeg',
                './img/sus-partiality.jpeg',
                './img/surreal-building.jpeg',
                './img/ai-painting.jpeg',
            ])
        ];
        this.started = false;
        this.currentMatches = 0;
        this.totalMatches = 0;
        this.totalCards = 0;
        this.flipListener = this.flipCard.bind(this);
    }
    initializeGameSets(){
        this.sets.forEach( set => {
            set.double();
            set.shuffle();
        });
    }
    setStatOutput(statName, value){
        this.stats.find( stat => stat.dataset.stats === statName).innerText = value.toString();
    }
    incrementCurrentMatches(){
        this.currentMatches++;
        this.setStatOutput('currentMatches', this.currentMatches);
    }
    resetCurrentMatches(){
        this.currentMatches = 0;
        this.setStatOutput('currentMatches', this.currentMatches);
    }
    setTotalMatches(num){
        this.totalMatches = num;
        this.setStatOutput('totalMatches', this.totalMatches);
    }
    setTotalCards(num){
        this.totalCards = num;
        this.setStatOutput('totalCards', this.totalCards);
    }
    setActiveSet(type){
        type = type || this.sets[0].type;
        this.activeSet = this.sets.find( set => set.type === type);
        
        if(this.activeSet){
            this.setTotalMatches(this.activeSet.set.length);
            this.setTotalCards(this.activeSet.doubled.length);
        }else{
            this.setTotalMatches(0);
            this.setTotalCards(0);
        } 
    }
    unflipCards(){
        this.cards.forEach( card => {
            if(card.dataset.matched == 'false'){
                if(card.querySelector('.card-inner').classList.contains('flipped')){
                    card.querySelector('.card-inner').classList.toggle('flipped');
                }
            }
        })
    }
    flipCard({currentTarget}){
        if(currentTarget.dataset.matched == 'true') return;
        const position = currentTarget.dataset.position;
        currentTarget.querySelector('.card-inner').classList.toggle('flipped');

        for(let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            if(card.dataset.matched == 'true') continue;
            if(card.querySelector('.card-inner').classList.contains('flipped')){
                if(card !== currentTarget){
                    if(card.dataset.position !== position){
                        setTimeout( this.unflipCards.bind(this), 1000);
                        break;
                    }else{
                        // matching cards
                        setTimeout( ()=> {
                            alert('Match!!!!');
                            this.incrementCurrentMatches();
                            currentTarget.removeEventListener('click', this.flipListener);
                            currentTarget.dataset.matched = true;
                            card.removeEventListener('click', this.flipListener);
                            card.dataset.matched = true;
                        }, 1000);
                        break;
                    }
                }
            }
        }
    }
    createCardElement(imagePosition){
        
        const li = document.createElement('li');
        li.classList.add('card');

        const inner = document.createElement('div');
        inner.classList.add('card-inner');

        const front = document.createElement('div');
        front.classList.add('card-front');

        const back = document.createElement('div');
        back.classList.add('card-back');

        if(imagePosition != undefined || imagePosition != null){
            const img = document.createElement('img');
            img.classList.add('card-back_img');
            img.src = this.activeSet.set[imagePosition];
            img.onload = ()=>{
                back.appendChild(img);
            }
            
        }

        inner.appendChild(front);
        inner.appendChild(back);
        
        li.appendChild(inner);

        return li;
    }
    createCards(){
        if(this.activeSet){
            const df = new DocumentFragment();

            this.activeSet.shuffled.forEach( shuffledPosition => {
                let card;
                if(this.activeSet.type === 'images'){
                    card = this.createCardElement(shuffledPosition)
                }else{
                    card = this.createCardElement(null);
                }
                
                df.appendChild(card);
            });

            this.cardList.appendChild(df);
            this.cards = [...this.cardList.querySelectorAll('.card')];
        }else{
            console.log('No active set in game.')
        }
    }
    setCards(){
        this.cards.forEach( (card,index) => {
            const back = card.querySelector('.card-inner .card-back');
            const position = this.activeSet.shuffled[index];
            card.dataset.position = position;
            card.dataset.matched = false;
            
            if(this.activeSet.type === 'colors'){
                back.style.backgroundColor = `hsl(${this.activeSet.set[position]} 100% 50%)`;
            }else if(this.activeSet.type === 'images'){
                //back.firstChild.src = this.activeSet.set[position];
            }else{
                back.style.backgroundColor = `hsl(0 0% 80%)`;
                back.style.color = 'hsl(0 0% 20%)';
                back.innerText = position;
            }
            card.addEventListener('click', this.flipListener);
        })
    }
    clearCards(){
        if(this.cardList){
            while(this.cardList.firstChild){
                this.cardList.removeChild(this.cardList.firstChild);
            }
        }
    }
    initializeGame(){
        this.initializeGameSets();
        this.setActiveSet('images');
        this.clearCards();
        this.createCards();
        this.setCards();

        const select = this.settings.find( selection => selection.dataset.settings === 'type');
        select.addEventListener('input', ({currentTarget})=>{
            const value = currentTarget.options[currentTarget.options.selectedIndex].value;
            if(value !== 'none'){
                this.setActiveSet(value);
                this.clearCards();
                this.createCards();
                this.setCards();
            }else{
                this.clearCards();
            }
            
        })
    }
}


function initializePage(){
  
    const GAME = new MemoryGame('.memory-game');
    GAME.initializeGame();

    console.log(GAME)
}
initializePage();