# Documentation des Statuts - Commandes et Livraisons

## Statuts des Commandes (Order Status)

Les commandes ont été mises à jour avec les statuts suivants :

### Valeurs Possibles
- **`en_cours`** : Commande en cours de traitement
- **`livrée`** : Commande livrée avec succès
- **`annulée`** : Commande annulée

### Code TypeScript
```typescript
export type OrderStatus = 'en_cours' | 'livrée' | 'annulée';
```

### Classes CSS
- `.en-cours` - Couleur : Orange (#f59e0b)
- `.livree` - Couleur : Vert (#10b981)
- `.annulee` - Couleur : Rouge (#e74c3c)

---

## Statuts des Livraisons (Delivery Status)

Les livraisons utilisent un système de statuts plus détaillé :

### Valeurs Possibles
- **`en_attente`** : En attente d'assignation à un livreur
- **`en_préparation`** : Commande acceptée et en préparation
- **`préparée`** : Commande préparée, prête à être récupérée
- **`en_livraison`** : Commande en cours de livraison
- **`livrée`** : Livraison terminée avec succès
- **`annulée`** : Livraison annulée

### Code TypeScript
```typescript
export type DeliveryStatus = 
  | 'en_attente'
  | 'en_préparation'
  | 'préparée'
  | 'annulée'
  | 'en_livraison'
  | 'livrée';
```

### Classes CSS
- `.en-attente` - Couleur : Orange (#f59e0b)
- `.en-preparation` - Couleur : Bleu (#3b82f6)
- `.preparee` - Couleur : Violet (#8b5cf6)
- `.en-livraison` - Couleur : Orange foncé (#f97316)
- `.livree` - Couleur : Vert (#10b981)
- `.annulee` - Couleur : Rouge (#e74c3c)

---

## Fichiers Modifiés

### Services
1. **`frontend/src/app/services/order.service.ts`** 
   - Interface `OrderStatus` avec les nouveaux statuts
   - Service de gestion des commandes

2. **`frontend/src/app/services/delivery.service.ts`** (NOUVEAU)
   - Interface `DeliveryStatus` avec tous les statuts de livraison
   - Service complet de gestion des livraisons

### Composants Admin
3. **`frontend/src/app/pages/admin/admin-dashboard/admin-dashboard.component.ts`**
   - Interface `Order` avec nouveaux statuts
   - Interface `Delivery` ajoutée
   - Fonctions `getStatusColor()`, `getStatusText()`, `getStatusClass()`
   - Fonctions `getDeliveryStatusColor()`, `getDeliveryStatusText()`, `getDeliveryStatusClass()`

4. **`frontend/src/app/pages/admin/admin-orders/admin-orders.component.ts`**
   - Statuts de commande mis à jour
   - Options de filtre mises à jour

### Composants Provider
5. **`frontend/src/app/pages/provider/provider-dashboard/provider-dashboard.component.ts`**
   - Statuts mis à jour dans les exemples de commandes

6. **`frontend/src/app/pages/provider/orders/orders.component.ts`**
   - Statuts mis à jour dans les exemples
   - Fonctions de mapping mises à jour

### Composants Livraison
7. **`frontend/src/app/pages/delivery/delivery.component.ts`**
   - Déjà conforme aux nouveaux statuts de livraison

### Fichiers CSS
8. **`frontend/src/app/pages/admin/admin-dashboard/admin-dashboard.component.css`**
   - Classes CSS pour statuts de commande
   - Classes CSS pour statuts de livraison

9. **`frontend/src/app/pages/admin/admin-orders/admin-orders.component.css`**
   - Classes CSS pour statuts de commande

10. **`frontend/src/app/pages/provider/orders/orders.component.css`**
    - Classes CSS pour statuts de commande

11. **`frontend/src/app/pages/provider/provider-dashboard/provider-dashboard.component.css`**
    - Classes CSS pour statuts de commande

---

## Migration de la Base de Données

### Table `commandes`
```sql
ALTER TABLE commandes 
MODIFY COLUMN statut ENUM('en_cours', 'livrée', 'annulée') DEFAULT 'en_cours';
```

### Table `livraisons`
```sql
ALTER TABLE livraisons 
MODIFY COLUMN statut ENUM(
  'en_attente',
  'en_préparation', 
  'préparée',
  'annulée',
  'en_livraison',
  'livrée'
) DEFAULT 'en_attente';
```

---

## Utilisation

### Dans un Composant TypeScript

#### Pour les Commandes
```typescript
import { OrderService, OrderStatus } from '../services/order.service';

// Changer le statut d'une commande
this.orderService.updateOrderStatus(orderId, 'livrée').subscribe({
  next: (order) => console.log('Commande mise à jour', order),
  error: (err) => console.error('Erreur', err)
});
```

#### Pour les Livraisons
```typescript
import { DeliveryService, DeliveryStatus } from '../services/delivery.service';

// Changer le statut d'une livraison
this.deliveryService.updateDeliveryStatus(deliveryId, 'en_livraison').subscribe({
  next: (delivery) => console.log('Livraison mise à jour', delivery),
  error: (err) => console.error('Erreur', err)
});
```

### Dans un Template HTML

```html
<!-- Afficher le statut d'une commande -->
<span [class]="'status-badge ' + getStatusClass(order.status)">
  {{ getStatusText(order.status) }}
</span>

<!-- Afficher le statut d'une livraison -->
<span [class]="'status-badge ' + getDeliveryStatusClass(delivery.status)">
  {{ getDeliveryStatusText(delivery.status) }}
</span>
```

---

## Notes Importantes

1. **Distinction Claire** : 
   - Les **commandes** utilisent 3 statuts simples
   - Les **livraisons** utilisent 6 statuts détaillés pour suivre tout le processus

2. **Cohérence** : Tous les fichiers frontend et backend doivent utiliser exactement les mêmes valeurs de statuts

3. **Validation** : Les APIs backend doivent valider que seuls les statuts autorisés sont acceptés

4. **Migration** : Assurez-vous de mettre à jour la base de données avant de déployer le frontend

5. **Tests** : Testez tous les cas d'usage pour chaque transition de statut
