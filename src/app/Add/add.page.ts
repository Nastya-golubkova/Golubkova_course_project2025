import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-add',
  templateUrl: 'add.page.html',
  styleUrls: ['add.page.scss']
})
export class AddPage implements OnInit, OnDestroy {

  mashPicture = 'assets/white.jpg';
  text = "";
  id = 1;
  subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {

    let idSubs = this.route.queryParamMap
    .pipe(
      map(params => {
        let id2 = Number(params.get('id'));
        console.log(params);
        return id2;
      }),
    )
    .subscribe(r => {
      console.log('subs', r);
      this.id = r;
      
      if (r == 1) {
        this.mashPicture = 'assets/white.jpg';
        this.text = "Шляпка зрелого гриба выпуклая, у старых грибов плоско-выпуклая, редко распростёртая.Мякоть крепкая, сочно-мясистая, у старых экземпляров волокнистая, белая у молодого гриба, желтеет с возрастом, не изменяет цвет после разрезания.Ножка массивная, бочковидная или булавовидная, с возрастом вытягивается и может становиться цилиндрической.";
      }
      if (r == 2) {
        this.mashPicture = 'assets/podberezovik.jpg';
        this.text = "У подберезовиков крупная шляпка диаметром 5-15 см различной окраски – от белого до коричневого и его оттенков. С внутренней стороны шляпки располагается трубчатый гименофор серого или белого окраса. Форма ножки цилиндрическая, расширяется книзу. Мякоть белая с приятным грибным ароматом, окраска на изломе может меняться в зависимости от разновидности гриба.";
      }
      if (r == 3) {
        this.mashPicture = 'assets/lisichka.jpg';
        this.text = "Плодовые тела по форме сходны со шляпконожечными, но шляпка и ножка представляют собой единое целое, без выраженной границы; цвет — от светло-жёлтого до оранжево-жёлтого. Ножка сросшаяся со шляпкой и одного с ней цвета.";
      }
      if (r == 4) {
        this.mashPicture = 'assets/podosinovik.jpg';
        this.text = "Красноватая шляпка, коренастая ножка с серо-бурыми чешуйками и плотная мякоть. С развитием гриба спороносный слой меняет цвет с белого до серого, а при повреждениях чернеет. Ножка диаметром 2-3 см и высотой 10-15 см покрыта многочисленными коричневыми чешуйками, утолщается к низу.";
      }


    });
   
    this.subs.push(idSubs);
    
  
  }



  


  ngOnDestroy(): void {
    this.subs.forEach(el=>el.unsubscribe());
  }
}
