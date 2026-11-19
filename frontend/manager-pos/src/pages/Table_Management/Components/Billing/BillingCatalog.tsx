import { Card } from "../../../../components/DataCard/Card";
import { SearchInput } from "../../../../components/InputField/SearchInput";
import { Tabs } from "../../../../components/Header/Tabs";
import { Button } from "../../../../components/Buttons/Button";
import { CATEGORIES } from "../../Config/billing.config";
import type { Dish } from "../../Types/billing.types";

interface Props {
  searchQuery: string; setSearchQuery: (q: string) => void;
  activeTab: string; setActiveTab: (t: string) => void;
  filteredDishes: Dish[]; addToCart: (id: number) => void;
}

export const BillingCatalog = ({ searchQuery, setSearchQuery, activeTab, setActiveTab, filteredDishes, addToCart }: Props) => (
  <Card className="h-full">
    <h3 className="font-serif text-lg text-primary mb-3">1. Menu & Dish Catalog</h3>
    <SearchInput placeholder="Search dishes…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
    <Tabs items={CATEGORIES} value={activeTab} onChange={setActiveTab} className="my-3" />
    <div className="grid gap-3 max-h-[62vh] overflow-y-auto pr-1">
      {filteredDishes.map((dish) => (
        <div key={dish.id} className="flex justify-between items-center p-3.5 border border-border-subtle rounded-md bg-surface hover:-translate-y-[2px] hover:border-accent-gold transition-transform">
          <div>
            <b className="text-sm">{dish.name}</b>
            <small className="block text-xs text-text-muted my-0.5">{dish.description}</small>
            <em className="text-sm font-bold text-accent-gold not-italic">₹{dish.price.toFixed(2)}</em>
          </div>
          <Button size="sm" onClick={() => addToCart(dish.id)}>+ ADD</Button>
        </div>
      ))}
    </div>
  </Card>
);