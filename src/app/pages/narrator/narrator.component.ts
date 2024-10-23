import { Component } from '@angular/core';
import { CircleComponent } from "../../components/circle/circle.component";
import { GameStateService } from '../../services/game-state.service';
import { DialogService } from '../../services/dialog.service';
import { ActionCallback, CirclePerson } from '../../types';

@Component({
  selector: 'app-narrator',
  standalone: true,
  imports: [CircleComponent],
  templateUrl: './narrator.component.html',
  styleUrl: './narrator.component.css'
})
export class NarratorComponent {
  constructor(public state: GameStateService, public dialog: DialogService) {
    state.StartGame();
  }

  public handleAction(fn: ActionCallback) {
    fn({
      gameState: this.state,
      dialog: this.dialog
    });
  }

  async handlePersonClicked(person: CirclePerson) {
    this.dialog.ShowPersonDialog(person);
  }

  getFilteredPoints(points: (string | false)[]) {
    return points.filter(Boolean) as string[]
  }
}
