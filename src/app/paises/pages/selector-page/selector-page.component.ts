import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaisSmall } from '../../interfaces/paises.interface';
import { switchMap, tap } from "rxjs/operators";

import { PaisesService } from '../../services/paises.service';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html'
})
export class SelectorPageComponent implements OnInit {

  miFormulario: FormGroup = this._fb.group({
    region  : [ '',Validators.required ],
    pais    : [ '',Validators.required ],
    frontera: [ '',Validators.required ]
    // frontera: [ {value:'',disabled: true },Validators.required ] // 1ra forma de deshabilitar el campo
  })

  // Llenar selectores
  regiones : string[]    = [];
  paises   : PaisSmall[] = [];
  // fronteras: string[]    = []
  fronteras: PaisSmall[]    = []

  // UI
  cargando: boolean = false;


  constructor(private _fb: FormBuilder,
              private _ps: PaisesService) { }

  ngOnInit(): void {

    this.regiones = this._ps.regiones

    // Cuando cambie la region (Best Method Simplified with Tap(RxJS))
    this.miFormulario.get('region')?.valueChanges
        .pipe(
          tap ( ( _ ) => {
            this.miFormulario.get('pais')?.reset('');
            this.cargando = true;
            // this.miFormulario.get('frontera')?.disable() // 2nda forma de deshabilitar el campo
          }),
          switchMap( region => this._ps.getPaisesPorRegion(region))
        )    
        .subscribe( paises => {
          this.paises = paises;
          this.cargando = false;
        });

    // Cuando cambie el país
    this.miFormulario.get('pais')?.valueChanges
        .pipe( 
          tap ( ()  => {
            this.miFormulario.get('frontera')?.reset('');
            this.cargando = true;
            // this.miFormulario.get('frontera')?.enable() // 2nda forma de deshabilitar el campo
          }),
          switchMap(codigo => this._ps.getPaisPorCodigo(codigo)),
          switchMap(pais => this._ps.getPaisesPorBorders(pais?.borders!))
        )
        .subscribe( paises => {
          this.fronteras = paises
          this.cargando = false;
        })



    // Cuando cambie la region (Metodo feo)
    // this.miFormulario.get('region')?.valueChanges
    //   .subscribe( region => {
    //     console.log(region);

    //     this._ps.getPaisesPorRegion(region).subscribe( paises => {
    //       this.paises = paises;
    //       console.log(paises);
          
    //     })
    //   })

  }

  guardar(){
    console.log(this.miFormulario.value);
  }

}
