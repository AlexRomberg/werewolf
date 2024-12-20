import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { GameStateService } from "../../services/game-state.service";
import { Router } from "@angular/router";
import { CardComponent } from "../../components/setup/card/card.component";
import { CardSelectionInformation, RoleGroup } from "../../types";
import { SpotifyWidgetComponent } from "../../components/spotify-widget/spotify-widget.component";
import { SpotifyService } from "../../services/spotify.service";
import { environment } from "../../../environments/environment";
import { catchError } from "rxjs";
import { StorageService } from "../../services/storage.service";

@Component({
    selector: "app-setup",
    standalone: true,
    imports: [FormsModule, CardComponent, SpotifyWidgetComponent],
    templateUrl: "./setup.component.html"
})
export class SetupComponent {
    public Roles: RoleGroup[];
    public PeopleCount: number;

    constructor(private state: GameStateService, private router: Router, private spotify: SpotifyService, private storage: StorageService) {
        this.Roles = storage.SetupSelection;
        this.PeopleCount = storage.SetupPeopleCount;
    }

    public StartGame() {
        if (this.spotify.IsAuthenticated) {
            this.spotify.playPlaylist(environment.spotify.playlists.start, true, false).pipe(catchError(e => {
                alert("Spotify ist verbunden, aber weiss nicht auf welchem Gerät es abspielen soll. Lass bitte kurz ein Lied laufen und versuche es nochmals. Wenn dies nicht geht melde dich hier wieder von Spotify ab.");
                throw e;
            })).subscribe(() => {
                if (this.spotify.IsAuthenticated) {
                    this.router.navigateByUrl("/narrator");
                }
            });
        }
        this.state.Characters = this.Roles
            .map(r => r.cards)
            .flat()
            .filter(r => r.selected)
            .sort((ra, rb) => (ra.role.Priority ?? -1) - (rb.role.Priority ?? -1))
            .map(r => r.role);
        this.state.People = this.state.People.slice(0, this.PeopleCount);
        for (let i = 0; i < this.PeopleCount; i++) {
            const person = this.state.People[i];
            this.state.People[i] = {
                role: undefined,
                isVictim: false,
                isProtected: false,
                isEnchanted: false,
                isDead: false,
                isWerewolf: false,
                id: i,
                name: person?.name ?? ""
            };
        }

        this.state.StartGame();
        if (!this.spotify.IsAuthenticated) {
            this.router.navigateByUrl("/narrator");
        }
    }

    public handleSelectionStateChange(card: CardSelectionInformation, selected: boolean) {
        card.selected = selected;
        this.storage.SetupSelection = this.Roles;
    }

    public handlePeopleCountChanged(people: number) {
        this.PeopleCount = people;
        this.storage.SetupPeopleCount = people;
    }
}
