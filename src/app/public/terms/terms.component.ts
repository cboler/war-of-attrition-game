import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="legal-page-container">
      <mat-card class="legal-card">
        <mat-card-header>
          <div class="header-icon">
            <mat-icon>gavel</mat-icon>
          </div>
          <div class="header-titles">
            <mat-card-title>End User License Agreement</mat-card-title>
            <mat-card-subtitle>War of Attrition — Physical Card Game (Digital Edition)</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content class="legal-content">
          <div class="last-updated">Last Updated: October 1, 2026</div>

          <section>
            <h3>1. Agreement</h3>
            <p>
              This End User License Agreement ("Agreement") is between you and <strong>cboler</strong> ("we", "us", or "our")
              and governs your use of <strong>War of Attrition</strong>, including the web app, the Progressive Web App, and the
              Android app distributed on Google Play (together, the "Software"). By installing, opening, or playing the Software
              you agree to this Agreement. If you do not agree, do not use the Software. Our
              <a routerLink="/privacy">Privacy Policy</a> explains how data is handled and is separate from this Agreement.
            </p>
          </section>

          <section>
            <h3>2. License Grant</h3>
            <p>
              We grant you a personal, non-exclusive, non-transferable, revocable, royalty-free license to use the Software
              for your own personal, non-commercial entertainment.
            </p>
          </section>

          <section>
            <h3>3. Open-Source Software</h3>
            <p>
              The source code of War of Attrition is published under the
              <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener">GNU General Public License, version 3</a>
              (the "GPL") in the project <a href="https://github.com/cboler/war-of-attrition-game" target="_blank" rel="noopener">repository</a>.
              Nothing in this Agreement limits any right the GPL gives you to copy, modify, or redistribute that source code.
              If this Agreement conflicts with the GPL on those rights, the GPL controls. Third-party components included in the
              Software remain under their own licenses.
            </p>
          </section>

          <section>
            <h3>4. Acceptable Use</h3>
            <p>Except where the GPL allows it, or where applicable law does not allow this restriction, you agree not to:</p>
            <ul>
              <li>use the Software for anything unlawful, or to harass or harm others;</li>
              <li>interfere with or disrupt any service the Software connects to, including Google services;</li>
              <li>attempt to falsify achievements, statistics, or analytics submitted from the Software; or</li>
              <li>remove or alter copyright, attribution, or license notices.</li>
            </ul>
          </section>

          <section>
            <h3>5. Third-Party Services</h3>
            <p>
              Optional features rely on third-party services such as Google Identity Services, Google Play Games Services, and
              Google Analytics. Your use of those services is governed by their own terms and policies, and we are not responsible
              for them or for their availability.
            </p>
          </section>

          <section>
            <h3>6. Ownership</h3>
            <p>
              Subject to the GPL, we and our licensors retain all rights in the Software, including the game's name, artwork,
              card designs, and story content. This Agreement does not transfer ownership of anything to you.
            </p>
          </section>

          <section>
            <h3>7. No Purchases</h3>
            <p>
              The Software is free to play. It has no in-app purchases, and tokens and cosmetics have no cash value and cannot be
              bought, sold, or exchanged for money.
            </p>
          </section>

          <section>
            <h3>8. Updates & Changes</h3>
            <p>
              The Software may update automatically when you are online. We may change, suspend, or discontinue any feature or the
              Software itself at any time without notice. We may update this Agreement from time to time; the "Last Updated"
              date above shows the current version, and continued use after a change means you accept it.
            </p>
          </section>

          <section class="disclaimer">
            <h3>9. Disclaimer of Warranties</h3>
            <p>
              <strong>
                THE SOFTWARE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
                BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND
                NON-INFRINGEMENT.
              </strong>
              We do not warrant that the Software will be uninterrupted, error-free, or secure, that defects will be corrected, or
              that saved progress, statistics, or achievements will never be lost. The Software stores data on your device, and
              you are responsible for it.
            </p>
          </section>

          <section class="disclaimer">
            <h3>10. Limitation of Liability</h3>
            <p>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
                CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF,
                OR IN CONNECTION WITH THE SOFTWARE OR ITS USE, INCLUDING ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
                CONSEQUENTIAL DAMAGES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </strong>
              Because the Software is free, our total liability to you for any claim relating to it will not exceed zero dollars
              (US $0), to the extent the law allows. Some jurisdictions do not allow certain exclusions or limitations, so parts
              of this section may not apply to you, and you may have rights that cannot be waived.
            </p>
          </section>

          <section>
            <h3>11. Termination</h3>
            <p>
              This Agreement lasts until terminated. It ends automatically if you breach it, and you may end it at any time by
              uninstalling the Software and deleting its data. Sections 3, 6, and 9 through 12 survive termination.
            </p>
          </section>

          <section>
            <h3>12. General</h3>
            <p>
              If any part of this Agreement is held unenforceable, the rest stays in effect. Our failure to enforce a provision is
              not a waiver of it. You may not assign this Agreement without our consent; we may assign it freely. This Agreement,
              together with the GPL and the Privacy Policy, is the entire agreement between you and us about the Software.
            </p>
          </section>

          <section>
            <h3>13. Contact</h3>
            <p>
              Questions about this Agreement? Visit our <a routerLink="/support">Support Page</a> or contact us by email.
            </p>
          </section>
        </mat-card-content>

        <mat-divider></mat-divider>

        <mat-card-actions class="legal-actions">
          <button mat-raised-button color="primary" routerLink="/">
            <mat-icon>arrow_back</mat-icon> Return to Game
          </button>
          <button mat-button routerLink="/privacy">
            <mat-icon>privacy_tip</mat-icon> Privacy Policy
          </button>
          <button mat-button routerLink="/support">
            <mat-icon>help_outline</mat-icon> Support
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrls: ['./legal-pages.scss']
})
export class TermsComponent {}
