import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { select, Store } from '@ngrx/store'
import { GeoJSONSource, Map } from 'maplibre-gl'
import { MARKER_PAINT } from 'src/constants/marker-paint'
import { u9 } from 'src/constants/u9'
import { environment } from 'src/environments/environment'
import { RootState } from 'src/store/app.store'
import { TransitLinesActions } from 'src/store/transit-lines/transit-lines.actions'
import { fromTransitLines } from 'src/store/transit-lines/transit-lines.selectors'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
  @ViewChild('map', { static: true }) private mapRef: ElementRef<HTMLElement>

  private map: Map

  constructor(private store: Store<RootState>) {
    // Issue https://github.com/targomo/typescript-challenge-frontend/issues/3
    this.store.dispatch(TransitLinesActions.AddLine({ line: u9 }))
  }

  ngOnInit(): void {
    this.map = new Map({
      center: { lat: 52.52, lng: 13.4 },
      zoom: 10,
      container: this.mapRef.nativeElement,
      style: `https://api.maptiler.com/maps/dataviz-light/style.json?key=${environment.maptilerApiKey}`,
    })

    this.map.once('load', () => {
      const stopsSource$ = this.store.pipe(select(fromTransitLines.stopsPointGeoJson))
      const linesSource$ = this.store.pipe(select(fromTransitLines.stopsLinesGeoJson))
      const STOPS_SOURCE_ID = 'stops-source'
      const LINES_SOURCE_ID = 'lines-source'

      stopsSource$.subscribe((source) => {
        const exsitingSource = this.map.getSource(STOPS_SOURCE_ID) as GeoJSONSource
        if (exsitingSource) {
          exsitingSource.setData(source.data)
        } else {
          this.map.addSource(STOPS_SOURCE_ID, source)
        }
      })

      linesSource$.subscribe((source) => {
        const exsitingSource = this.map.getSource(LINES_SOURCE_ID) as GeoJSONSource
        if (exsitingSource) {
          exsitingSource.setData(source.data)
        } else {
          this.map.addSource(LINES_SOURCE_ID, source)
        }
      })

      const STOPS_LAYER_ID = 'stops-layer'
      const LINES_LAYER_ID = 'lines-layer'
      this.map.addLayer({ type: 'circle', source: STOPS_SOURCE_ID, id: STOPS_LAYER_ID, paint: MARKER_PAINT })
      this.map.addLayer({ type: 'line', source: LINES_SOURCE_ID, id: LINES_LAYER_ID})
      // The following issues are likely to be implemented here
      // https://github.com/targomo/typescript-challenge-frontend/issues/2
      // https://github.com/targomo/typescript-challenge-frontend/issues/2
      // https://github.com/targomo/typescript-challenge-frontend/issues/6
      // https://github.com/targomo/typescript-challenge-frontend/issues/8
    })
  }
}
