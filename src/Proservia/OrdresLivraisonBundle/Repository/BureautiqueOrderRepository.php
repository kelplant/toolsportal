<?php
namespace Proservia\OrdresLivraisonBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * Class BureautiqueOrderRepository
 * @package Proservia\OrdresLivraisonBundle\Repository
 */
class BureautiqueOrderRepository extends EntityRepository
{
    /**
     * @return array
     */
    public function findAll()
    {
        return $this->findBy(array(), array('date' => 'DESC'));
    }
}