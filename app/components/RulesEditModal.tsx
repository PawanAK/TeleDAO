import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RulesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRules: string;
  onSave: (newRules: string) => void;
}

export function RulesEditModal({ isOpen, onClose, currentRules, onSave }: RulesEditModalProps) {
  const [rules, setRules] = React.useState(currentRules);

  const handleSave = () => {
    onSave(rules);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Community Rules</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            className="h-[200px]"
            placeholder="Enter community rules..."
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 